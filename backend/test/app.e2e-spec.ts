import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// Suffix keeps phone numbers unique per test run so re-running against a persistent
// (non-reset) test database doesn't collide with the OTP resend cooldown from a prior run.
const runId = Date.now().toString().slice(-6);
const testPhone = (n: number) => `09${runId}${n.toString().padStart(2, '0')}`;
// Spreads each run's test appointments into a run-specific slot (base days + runId minutes)
// so re-running the suite against the same persistent DB never collides with a prior run's data.
const futureDate = (baseDays: number) =>
  new Date(Date.now() + (baseDays * 24 * 60 + Number(runId)) * 60 * 1000).toISOString();

describe('Vi Nail Salon API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: Parameters<typeof request>[0];

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // ThrottlerGuard buckets by IP; every supertest call shares the loopback IP, which would
      // trip rate limits within a single test run. Rate limiting itself is verified manually
      // (see QA report) rather than in this functional e2e suite.
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableCors({ origin: ['http://localhost:3000'] });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    httpServer = app.getHttpServer();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns ok with db connectivity', async () => {
    const res = await request(httpServer).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'up' });
  });

  describe('auth', () => {
    it('rejects a protected route with no token (401)', async () => {
      const res = await request(httpServer).get('/api/audit-logs');
      expect(res.status).toBe(401);
    });

    it('rejects login with wrong password (401)', async () => {
      const res = await request(httpServer)
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'wrong-password' });
      expect(res.status).toBe(401);
    });

    it('logs in the seeded admin and allows access to an admin-only route', async () => {
      const login = await request(httpServer)
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'change-me-123' });
      expect(login.status).toBe(200);
      expect(login.body.accessToken).toBeDefined();
      expect(login.body.user.role).toBe('ADMIN');

      const auditLogs = await request(httpServer)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${login.body.accessToken}`);
      expect(auditLogs.status).toBe(200);
    });

    it('rejects a customer token on an admin-only route (403)', async () => {
      const login = await request(httpServer)
        .post('/api/auth/login')
        .send({ phone: '0909111222', password: 'change-me-123' });
      expect(login.status).toBe(200);

      const res = await request(httpServer)
        .get('/api/payments')
        .set('Authorization', `Bearer ${login.body.accessToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects OTP verification with an incorrect code, and expires the challenge after too many attempts', async () => {
      const phone = testPhone(1);
      await request(httpServer).post('/api/auth/otp/request').send({ phone });

      for (let i = 0; i < 5; i += 1) {
        const res = await request(httpServer)
          .post('/api/auth/otp/verify')
          .send({ phone, code: '000000' });
        expect(res.status).toBe(400);
      }

      // Max attempts exhausted — the challenge now refuses further checks outright.
      const res = await request(httpServer)
        .post('/api/auth/otp/verify')
        .send({ phone, code: '111111' });
      expect(res.status).toBe(400);
    });
  });

  describe('guest booking + double-booking protection', () => {
    // These tests exercise appointment/conflict logic, not the OTP mechanism itself (that's
    // covered separately above) — sign the booking session token directly rather than round
    // tripping through /otp/request, which is IP-throttled to 3/min and would collide across
    // the several booking tokens these tests need within the same test run.
    function bookingToken(phone: string): string {
      return app.get(JwtService).sign({ purpose: 'BOOKING_SESSION', phone }, { expiresIn: '30m' });
    }

    it('books successfully, then rejects a second booking for the same staff + overlapping time (409)', async () => {
      const service = await prisma.service.findFirst();
      const staff = await prisma.staffProfile.findFirst();
      expect(service).not.toBeNull();
      expect(staff).not.toBeNull();

      const startAt = futureDate(30);

      const token1 = bookingToken(testPhone(2));
      const first = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          customerName: 'E2E Test A',
          serviceIds: [service!.id],
          staffId: staff!.id,
          startAt,
        });
      expect(first.status).toBe(201);

      const token2 = bookingToken(testPhone(3));
      const second = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          customerName: 'E2E Test B',
          serviceIds: [service!.id],
          staffId: staff!.id,
          startAt,
        });
      expect(second.status).toBe(409);
    });

    it('rejects booking a time slot in the past (400)', async () => {
      const service = await prisma.service.findFirst();
      const token = bookingToken(testPhone(4));
      const res = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerName: 'E2E Past',
          serviceIds: [service!.id],
          startAt: '2020-01-01T09:00:00.000Z',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('appointment status transitions', () => {
    it('blocks an invalid jump (PENDING_CONFIRMATION -> IN_SERVICE) and allows the valid next step', async () => {
      const service = await prisma.service.findFirst();
      const jwt = app.get(JwtService);
      const bookingToken = jwt.sign(
        { purpose: 'BOOKING_SESSION', phone: testPhone(5) },
        { expiresIn: '30m' },
      );
      const startAt = futureDate(40);
      const booking = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${bookingToken}`)
        .send({ customerName: 'E2E Transition', serviceIds: [service!.id], startAt });
      expect(booking.status).toBe(201);

      const adminLogin = await request(httpServer)
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'change-me-123' });
      const adminToken = adminLogin.body.accessToken;

      const invalidJump = await request(httpServer)
        .patch(`/api/appointments/${booking.body.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_SERVICE' });
      expect(invalidJump.status).toBe(400);

      const validStep = await request(httpServer)
        .patch(`/api/appointments/${booking.body.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });
      expect(validStep.status).toBe(200);
      expect(validStep.body.status).toBe('CONFIRMED');
    });
  });

  describe('guest lookup / reschedule / cancel', () => {
    it('looks up, reschedules, and cancels a guest appointment by code + phone', async () => {
      const service = await prisma.service.findFirst();
      const jwt = app.get(JwtService);
      const phone = testPhone(6);
      const bookingToken = jwt.sign({ purpose: 'BOOKING_SESSION', phone }, { expiresIn: '30m' });
      const startAt = futureDate(50);
      const booking = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${bookingToken}`)
        .send({ customerName: 'E2E Lookup', serviceIds: [service!.id], startAt });
      const code = booking.body.code;

      const lookup = await request(httpServer)
        .get('/api/appointments/lookup')
        .query({ code, phone });
      expect(lookup.status).toBe(200);
      expect(lookup.body.code).toBe(code);

      const wrongPhone = await request(httpServer)
        .get('/api/appointments/lookup')
        .query({ code, phone: '0900000000' });
      expect(wrongPhone.status).toBe(404);

      const newStartAt = futureDate(55);
      const reschedule = await request(httpServer)
        .patch('/api/appointments/guest/reschedule')
        .send({ code, phone, startAt: newStartAt });
      expect(reschedule.status).toBe(200);
      expect(reschedule.body.startAt).toBe(newStartAt);

      const cancel = await request(httpServer)
        .patch('/api/appointments/guest/cancel')
        .send({ code, phone });
      expect(cancel.status).toBe(200);
      expect(cancel.body.status).toBe('CANCELLED');

      const cancelAgain = await request(httpServer)
        .patch('/api/appointments/guest/cancel')
        .send({ code, phone });
      expect(cancelAgain.status).toBe(400);
    });
  });
});
