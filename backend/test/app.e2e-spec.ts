import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface LoginResponseBody {
  user: { id: string; role: string };
}

interface AppointmentResponseBody {
  id: string;
  code: string;
  status: string;
  startAt: string;
}

/** Reads a cookie's value straight off a response's raw Set-Cookie headers. */
function extractSetCookie(res: request.Response, name: string): string {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  const line = raw?.find((c) => c.startsWith(`${name}=`));
  if (!line) throw new Error(`Set-Cookie for "${name}" not found`);
  return line.split(';')[0].slice(name.length + 1);
}

/** True if the response's Set-Cookie header for `name` clears it (empty value + past
 * expiry) — what `res.clearCookie()` produces. */
function cookieWasCleared(res: request.Response, name: string): boolean {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  const line = raw?.find((c) => c.startsWith(`${name}=`));
  if (!line) return false;
  return line.startsWith(`${name}=;`) && /Expires=Thu, 01 Jan 1970/i.test(line);
}

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
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Parameters<typeof request>[0];
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

  describe('auth: session cookie lifecycle', () => {
    it('rejects a protected route with no session (401)', async () => {
      const res = await request(httpServer).get('/api/audit-logs');
      expect(res.status).toBe(401);
    });

    it('rejects login with wrong password (401)', async () => {
      const res = await request(httpServer)
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'wrong-password' });
      expect(res.status).toBe(401);
    });

    it('logs in the seeded admin, sets a session cookie, and allows access to an admin-only route', async () => {
      const agent = request.agent(httpServer);
      const login = await agent
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'change-me-123' });
      expect(login.status).toBe(200);
      expect((login.body as LoginResponseBody).user.role).toBe('ADMIN');
      // The access/refresh/CSRF tokens must never appear in the JSON body.
      expect(JSON.stringify(login.body)).not.toMatch(/token/i);

      const auditLogs = await agent.get('/api/audit-logs');
      expect(auditLogs.status).toBe(200);
    });

    it('rejects a customer session on an admin-only route (403)', async () => {
      const agent = request.agent(httpServer);
      await agent.post('/api/auth/login').send({ phone: '0909111222', password: 'change-me-123' });

      const res = await agent.get('/api/payments');
      expect(res.status).toBe(403);
    });

    it('POST /api/auth/refresh rotates the session and keeps it usable', async () => {
      const agent = request.agent(httpServer);
      await agent.post('/api/auth/login').send({ phone: '0900112233', password: 'change-me-123' });

      const refreshed = await agent.post('/api/auth/refresh');
      expect(refreshed.status).toBe(200);

      const stillWorks = await agent.get('/api/audit-logs');
      expect(stillWorks.status).toBe(200);
    });

    it('replaying a refresh token from before logout is rejected (reuse detection)', async () => {
      // Capture the refresh token as it stood right after login, then let the same agent
      // continue on to log out (which revokes that token) — simulating an attacker who
      // intercepted the cookie before the legitimate user logged out.
      const agent = request.agent(httpServer);
      const login = await agent
        .post('/api/auth/login')
        .send({ phone: '0909111222', password: 'change-me-123' });
      const stolenRefreshToken = extractSetCookie(login, 'vi_nail_refresh_token');

      await agent.post('/api/auth/logout');

      const replay = await request(httpServer)
        .post('/api/auth/refresh')
        .set('Cookie', `vi_nail_refresh_token=${stolenRefreshToken}`);
      expect(replay.status).toBe(401);
    });

    it('a failed refresh (expired/revoked token) clears cookies, including the non-httpOnly CSRF marker', async () => {
      // Same reuse-after-logout scenario as above, but this time asserting on the specific
      // Set-Cookie headers of the 401 response itself — a stale CSRF marker cookie left behind
      // here is exactly what would make the frontend keep retrying refresh forever afterward.
      const agent = request.agent(httpServer);
      const login = await agent
        .post('/api/auth/login')
        .send({ phone: '0909111222', password: 'change-me-123' });
      const staleRefreshToken = extractSetCookie(login, 'vi_nail_refresh_token');
      await agent.post('/api/auth/logout');

      const failedRefresh = await request(httpServer)
        .post('/api/auth/refresh')
        .set('Cookie', `vi_nail_refresh_token=${staleRefreshToken}`);
      expect(failedRefresh.status).toBe(401);
      expect(cookieWasCleared(failedRefresh, 'vi_nail_csrf_token')).toBe(true);
      expect(cookieWasCleared(failedRefresh, 'vi_nail_access_token')).toBe(true);
      expect(cookieWasCleared(failedRefresh, 'vi_nail_refresh_token')).toBe(true);
    });

    it('a self-forged CSRF marker cookie (never having logged in) grants no access', async () => {
      // The CSRF cookie is intentionally non-httpOnly and readable by JS — the frontend uses
      // its mere presence as a UX signal ("might have a session, worth trying refresh"). It
      // must never be treated as proof of identity anywhere server-side.
      const res = await request(httpServer)
        .get('/api/auth/me')
        .set('Cookie', 'vi_nail_csrf_token=attacker-forged-value-12345');
      expect(res.status).toBe(401);
    });

    it('logout revokes the session (subsequent requests are unauthenticated)', async () => {
      const agent = request.agent(httpServer);
      await agent.post('/api/auth/login').send({ phone: '0909111222', password: 'change-me-123' });
      expect((await agent.get('/api/auth/me')).status).toBe(200);

      const logout = await agent.post('/api/auth/logout');
      expect(logout.status).toBe(200);

      expect((await agent.get('/api/auth/me')).status).toBe(401);
    });

    it('a locked account (isActive=false) loses access immediately, even mid-session', async () => {
      const phone = testPhone(9);
      const passwordHash = await import('argon2').then((a) => a.hash('change-me-123'));
      const user = await prisma.user.create({
        data: { phone, name: 'E2E Lock Test', passwordHash, role: 'CUSTOMER' },
      });

      const agent = request.agent(httpServer);
      const login = await agent.post('/api/auth/login').send({ phone, password: 'change-me-123' });
      expect(login.status).toBe(200);
      expect((await agent.get('/api/auth/me')).status).toBe(200);

      await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });

      // Same session cookie, no new login — the guard re-checks isActive from the DB on
      // every request rather than trusting a cached claim in the token.
      expect((await agent.get('/api/auth/me')).status).toBe(403);

      const loginWhileLocked = await request(httpServer)
        .post('/api/auth/login')
        .send({ phone, password: 'change-me-123' });
      expect(loginWhileLocked.status).toBe(403);
    });

    it('rejects a mutating request from an authenticated session without the CSRF header (403)', async () => {
      const agent = request.agent(httpServer);
      await agent.post('/api/auth/login').send({ phone: '0900112233', password: 'change-me-123' });

      const res = await agent.patch('/api/appointments/nonexistent-id/status').send({ status: 'CONFIRMED' });
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

  describe('test-only OTP mailbox', () => {
    it('rejects reading the mailbox without the correct TEST_SECRET header (404)', async () => {
      const phone = testPhone(7);
      await request(httpServer).post('/api/auth/otp/request').send({ phone });

      const noHeader = await request(httpServer).get('/api/test-only/otp').query({ phone });
      expect(noHeader.status).toBe(404);

      const wrongSecret = await request(httpServer)
        .get('/api/test-only/otp')
        .query({ phone })
        .set('x-test-secret', 'not-the-real-secret');
      expect(wrongSecret.status).toBe(404);
    });

    it('completes a real guest booking end to end through the actual OTP flow (no shortcuts)', async () => {
      const phone = testPhone(8);
      const testSecret = process.env.TEST_SECRET!;
      expect(testSecret).toBeDefined();

      const otpRequest = await request(httpServer).post('/api/auth/otp/request').send({ phone });
      expect(otpRequest.status).toBe(200);

      const mailbox = await request(httpServer)
        .get('/api/test-only/otp')
        .query({ phone })
        .set('x-test-secret', testSecret);
      expect(mailbox.status).toBe(200);
      const code = (mailbox.body as { code: string }).code;
      expect(code).toMatch(/^\d{6}$/);

      // The mailbox is consumed on read — a second read finds nothing left.
      const secondRead = await request(httpServer)
        .get('/api/test-only/otp')
        .query({ phone })
        .set('x-test-secret', testSecret);
      expect(secondRead.status).toBe(404);

      const verify = await request(httpServer).post('/api/auth/otp/verify').send({ phone, code });
      expect(verify.status).toBe(200);
      const bookingSessionToken = (verify.body as { bookingSessionToken: string }).bookingSessionToken;
      expect(bookingSessionToken).toBeDefined();

      const service = await prisma.service.findFirst();
      const booking = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${bookingSessionToken}`)
        .send({ customerName: 'E2E Real OTP', serviceIds: [service!.id], startAt: futureDate(60) });
      expect(booking.status).toBe(201);
      expect((booking.body as AppointmentResponseBody).code).toMatch(/^VN-\d+$/);
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

  describe('PostgreSQL exclusion constraint (appointments_no_staff_overlap)', () => {
    function bookingToken(phone: string): string {
      return app.get(JwtService).sign({ purpose: 'BOOKING_SESSION', phone }, { expiresIn: '30m' });
    }

    async function book(phone: string, staffId: string, startAt: string, name = 'E2E Concurrency') {
      const service = await prisma.service.findFirst();
      return request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${bookingToken(phone)}`)
        .send({ customerName: name, serviceIds: [service!.id], staffId, startAt });
    }

    it('under real concurrency, exactly one of two simultaneous overlapping bookings succeeds', async () => {
      const staff = await prisma.staffProfile.findFirst();
      const startAt = futureDate(90);

      const [a, b] = await Promise.all([
        book(testPhone(10), staff!.id, startAt, 'E2E Race A'),
        book(testPhone(11), staff!.id, startAt, 'E2E Race B'),
      ]);

      const statuses = [a.status, b.status].sort();
      expect(statuses).toEqual([201, 409]);
    });

    it('adjacent [start, end) ranges for the same staff do not falsely collide', async () => {
      const staff = await prisma.staffProfile.findFirst();
      const startAt = futureDate(95);
      const first = await book(testPhone(12), staff!.id, startAt, 'E2E Adjacent A');
      expect(first.status).toBe(201);

      const durationMinutes = (first.body as { totalDurationMinutes: number }).totalDurationMinutes;
      const adjacentStart = new Date(new Date(startAt).getTime() + durationMinutes * 60 * 1000).toISOString();
      const second = await book(testPhone(13), staff!.id, adjacentStart, 'E2E Adjacent B');
      expect(second.status).toBe(201);
    });

    it('a CANCELLED appointment does not hold its slot for the same staff', async () => {
      const staff = await prisma.staffProfile.findFirst();
      const startAt = futureDate(100);
      const first = await book(testPhone(14), staff!.id, startAt, 'E2E Cancel-Then-Rebook');
      expect(first.status).toBe(201);
      const code = (first.body as AppointmentResponseBody).code;

      const cancel = await request(httpServer)
        .patch('/api/appointments/guest/cancel')
        .send({ code, phone: testPhone(14) });
      expect(cancel.status).toBe(200);

      const second = await book(testPhone(15), staff!.id, startAt, 'E2E Rebook After Cancel');
      expect(second.status).toBe(201);
    });

    it('the same time slot is valid for a different staff member', async () => {
      const staffMembers = await prisma.staffProfile.findMany({ take: 2 });
      if (staffMembers.length < 2) {
        // Seed data guarantees at least 2 staff; skip defensively rather than fail the suite
        // if that ever changes, since this test's only purpose is checking the WHERE clause
        // doesn't over-scope past staffId.
        return;
      }
      const startAt = futureDate(105);
      const first = await book(testPhone(16), staffMembers[0].id, startAt, 'E2E Diff Staff A');
      expect(first.status).toBe(201);
      const second = await book(testPhone(17), staffMembers[1].id, startAt, 'E2E Diff Staff B');
      expect(second.status).toBe(201);
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
      const bookingBody = booking.body as AppointmentResponseBody;

      const admin = request.agent(httpServer);
      const adminLogin = await admin
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'change-me-123' });
      const csrf = extractSetCookie(adminLogin, 'vi_nail_csrf_token');

      const invalidJump = await admin
        .patch(`/api/appointments/${bookingBody.id}/status`)
        .set('x-csrf-token', csrf)
        .send({ status: 'IN_SERVICE' });
      expect(invalidJump.status).toBe(400);

      const validStep = await admin
        .patch(`/api/appointments/${bookingBody.id}/status`)
        .set('x-csrf-token', csrf)
        .send({ status: 'CONFIRMED' });
      expect(validStep.status).toBe(200);
      expect((validStep.body as AppointmentResponseBody).status).toBe('CONFIRMED');
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
      const code = (booking.body as AppointmentResponseBody).code;

      const lookup = await request(httpServer)
        .get('/api/appointments/lookup')
        .query({ code, phone });
      expect(lookup.status).toBe(200);
      expect((lookup.body as AppointmentResponseBody).code).toBe(code);

      const wrongPhone = await request(httpServer)
        .get('/api/appointments/lookup')
        .query({ code, phone: '0900000000' });
      expect(wrongPhone.status).toBe(404);

      const newStartAt = futureDate(55);
      const reschedule = await request(httpServer)
        .patch('/api/appointments/guest/reschedule')
        .send({ code, phone, startAt: newStartAt });
      expect(reschedule.status).toBe(200);
      expect((reschedule.body as AppointmentResponseBody).startAt).toBe(newStartAt);

      const cancel = await request(httpServer)
        .patch('/api/appointments/guest/cancel')
        .send({ code, phone });
      expect(cancel.status).toBe(200);
      expect((cancel.body as AppointmentResponseBody).status).toBe('CANCELLED');

      const cancelAgain = await request(httpServer)
        .patch('/api/appointments/guest/cancel')
        .send({ code, phone });
      expect(cancelAgain.status).toBe(400);
    });
  });

  describe('security regression', () => {
    async function registerCustomer(): Promise<{ agent: ReturnType<typeof request.agent>; phone: string; userId: string }> {
      const phone = `09${Date.now().toString().slice(-8)}`;
      const agent = request.agent(httpServer);
      const res = await agent
        .post('/api/auth/register')
        .send({ name: 'E2E Security', phone, password: 'change-me-123' });
      expect(res.status).toBe(201);
      return { agent, phone, userId: (res.body as LoginResponseBody).user.id };
    }

    it("a customer cannot view another customer's appointment by id (403)", async () => {
      const customerA = await registerCustomer();
      const service = await prisma.service.findFirst();
      const adminAgent = request.agent(httpServer);
      const adminLogin = await adminAgent.post('/api/auth/login').send({ phone: '0900112233', password: 'change-me-123' });
      const csrfToken = extractSetCookie(adminLogin, 'vi_nail_csrf_token');
      const created = await adminAgent
        .post('/api/appointments/staff')
        .set('x-csrf-token', csrfToken)
        .send({
          customerName: 'E2E Security A',
          customerPhone: customerA.phone,
          serviceIds: [service!.id],
          startAt: futureDate(110),
        });
      expect(created.status).toBe(201);
      const appointmentId = (created.body as { id: string }).id;
      expect((created.body as { customerId: string | null }).customerId).toBe(customerA.userId);

      const customerB = await registerCustomer();
      const res = await customerB.agent.get(`/api/appointments/${appointmentId}`);
      expect(res.status).toBe(403);

      // The owner can still view their own.
      const ownRes = await customerA.agent.get(`/api/appointments/${appointmentId}`);
      expect(ownRes.status).toBe(200);
    });

    it("a staff member cannot view an appointment assigned to a different staff member (403)", async () => {
      const staffMembers = await prisma.staffProfile.findMany({ take: 2, include: { user: true } });
      expect(staffMembers.length).toBeGreaterThanOrEqual(2);
      const service = await prisma.service.findFirst();

      const adminAgent = request.agent(httpServer);
      const adminLogin = await adminAgent.post('/api/auth/login').send({ phone: '0900112233', password: 'change-me-123' });
      const csrfToken = extractSetCookie(adminLogin, 'vi_nail_csrf_token');
      const created = await adminAgent
        .post('/api/appointments/staff')
        .set('x-csrf-token', csrfToken)
        .send({
          customerName: 'E2E Security Staff',
          customerPhone: `09${Date.now().toString().slice(-8)}`,
          serviceIds: [service!.id],
          staffId: staffMembers[0].id,
          startAt: futureDate(115),
        });
      expect(created.status).toBe(201);
      const appointmentId = (created.body as { id: string }).id;

      const otherStaffAgent = request.agent(httpServer);
      await otherStaffAgent
        .post('/api/auth/login')
        .send({ phone: staffMembers[1].user.phone, password: 'change-me-123' });
      const res = await otherStaffAgent.get(`/api/appointments/${appointmentId}`);
      expect(res.status).toBe(403);

      const listRes = await otherStaffAgent.get('/api/appointments');
      expect(listRes.status).toBe(200);
      expect((listRes.body as { id: string }[]).some((a) => a.id === appointmentId)).toBe(false);
    });

    it('a guest looking up by code cannot retrieve a different appointment sharing the same phone (wrong code -> 404)', async () => {
      const service = await prisma.service.findFirst();
      const jwt = app.get(JwtService);
      const phone = testPhone(20);
      const token = jwt.sign({ purpose: 'BOOKING_SESSION', phone }, { expiresIn: '30m' });

      const first = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerName: 'E2E Same Phone A', serviceIds: [service!.id], startAt: futureDate(120) });
      const second = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerName: 'E2E Same Phone B', serviceIds: [service!.id], startAt: futureDate(121) });
      expect(first.status).toBe(201);
      expect(second.status).toBe(201);

      const codeA = (first.body as AppointmentResponseBody).code;
      const codeB = (second.body as AppointmentResponseBody).code;
      expect(codeA).not.toBe(codeB);

      // Correct phone but the OTHER appointment's actual code still only returns that specific
      // appointment, never a different one sharing the same phone.
      const lookup = await request(httpServer).get('/api/appointments/lookup').query({ code: codeA, phone });
      expect(lookup.status).toBe(200);
      expect((lookup.body as AppointmentResponseBody).code).toBe(codeA);

      // A code that doesn't exist at all, even with a valid phone, is not found.
      const wrongCode = await request(httpServer)
        .get('/api/appointments/lookup')
        .query({ code: 'VN-000000', phone });
      expect(wrongCode.status).toBe(404);
    });

    it('rejects OTP verification after the challenge has expired (400)', async () => {
      const phone = testPhone(21);
      const secret = process.env.TEST_SECRET ?? 'change-me-test-secret';

      await request(httpServer).post('/api/auth/otp/request').send({ phone });
      const mailbox = await request(httpServer)
        .get('/api/test-only/otp')
        .query({ phone })
        .set('x-test-secret', secret);
      expect(mailbox.status).toBe(200);
      const code = (mailbox.body as { code: string }).code;

      const challenge = await prisma.otpChallenge.findFirst({
        where: { phone },
        orderBy: { createdAt: 'desc' },
      });
      expect(challenge).not.toBeNull();
      await prisma.otpChallenge.update({
        where: { id: challenge!.id },
        data: { expiresAt: new Date(Date.now() - 60_000) },
      });

      const verify = await request(httpServer).post('/api/auth/otp/verify').send({ phone, code });
      expect(verify.status).toBe(400);
    });

    it('a guest-access token (magic link) can only be exchanged once (single-use)', async () => {
      const service = await prisma.service.findFirst();
      const jwt = app.get(JwtService);
      const phone = testPhone(22);
      const bookingToken = jwt.sign({ purpose: 'BOOKING_SESSION', phone }, { expiresIn: '30m' });
      const booking = await request(httpServer)
        .post('/api/appointments/guest')
        .set('Authorization', `Bearer ${bookingToken}`)
        .send({ customerName: 'E2E Magic Link', serviceIds: [service!.id], startAt: futureDate(125) });
      const appointmentId = (booking.body as { id: string }).id;

      const staffAgent = request.agent(httpServer);
      const staffLogin = await staffAgent
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'change-me-123' });
      const staffCsrf = extractSetCookie(staffLogin, 'vi_nail_csrf_token');
      const issue = await staffAgent
        .post(`/api/appointments/${appointmentId}/guest-access`)
        .set('x-csrf-token', staffCsrf);
      expect(issue.status).toBe(201);
      const magicToken = (issue.body as { token: string }).token;

      const firstExchange = await request(httpServer)
        .post('/api/auth/guest-access/exchange')
        .send({ token: magicToken });
      expect(firstExchange.status).toBe(200);
      expect((firstExchange.body as { ok: boolean }).ok).toBe(true);

      const secondExchange = await request(httpServer)
        .post('/api/auth/guest-access/exchange')
        .send({ token: magicToken });
      expect(secondExchange.status).toBe(200);
      expect((secondExchange.body as { ok: boolean }).ok).toBe(false);
    });

    it('ValidationPipe strips/rejects unknown fields, blocking mass assignment of role or price', async () => {
      const phone = `09${Date.now().toString().slice(-8)}`;
      const res = await request(httpServer)
        .post('/api/auth/register')
        .send({ name: 'E2E Mass Assign', phone, password: 'change-me-123', role: 'ADMIN' });
      expect(res.status).toBe(400);
    });

    // Auth/OTP rate limiting is deliberately bypassed in this suite (NODE_ENV=test swaps in a
    // no-op throttler guard — see AppModule) because Jest's `.overrideGuard()` doesn't reliably
    // intercept APP_GUARD-registered guards, and dozens of tests here log in repeatedly. That
    // makes this suite the wrong place to verify the throttle actually engages; it's verified
    // instead against the real dev stack (ThrottlerGuard live, NODE_ENV=development) via a
    // scripted curl check — see the QA report for the observed 429 after 5 attempts/min.
  });

  describe('admin/staff creates an appointment on behalf of a customer', () => {
    it('links to an existing customer account by phone, records createdByUserId, and writes an audit log entry', async () => {
      const service = await prisma.service.findFirst();
      const agent = request.agent(httpServer);
      const login = await agent
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'change-me-123' });
      const csrfToken = extractSetCookie(login, 'vi_nail_csrf_token');
      const adminId = (login.body as LoginResponseBody).user.id;

      const existingCustomer = await prisma.user.findUnique({ where: { phone: '0909111222' } });
      expect(existingCustomer).not.toBeNull();

      const res = await agent
        .post('/api/appointments/staff')
        .set('x-csrf-token', csrfToken)
        .send({
          customerName: 'Khách quen',
          customerPhone: '0909111222',
          serviceIds: [service!.id],
          startAt: futureDate(70),
        });
      expect(res.status).toBe(201);
      const appointment = res.body as AppointmentResponseBody & {
        customerId: string | null;
        createdByUserId: string | null;
      };
      expect(appointment.customerId).toBe(existingCustomer!.id);
      expect(appointment.createdByUserId).toBe(adminId);

      const auditLogs = await agent.get('/api/audit-logs');
      expect(auditLogs.status).toBe(200);
      const entry = (auditLogs.body as { resourceLabel: string; action: string; actorId: string }[]).find(
        (l) => l.resourceLabel === appointment.code,
      );
      expect(entry).toBeDefined();
      expect(entry!.action).toBe('Tạo lịch hẹn hộ khách hàng');
      expect(entry!.actorId).toBe(adminId);
    });

    it('leaves customerId null for a phone with no existing customer account (stays guest-like)', async () => {
      const service = await prisma.service.findFirst();
      const agent = request.agent(httpServer);
      const login = await agent
        .post('/api/auth/login')
        .send({ phone: '0900112233', password: 'change-me-123' });
      const csrfToken = extractSetCookie(login, 'vi_nail_csrf_token');

      const newPhone = `09${Date.now().toString().slice(-8)}`;
      const res = await agent
        .post('/api/appointments/staff')
        .set('x-csrf-token', csrfToken)
        .send({
          customerName: 'Khách vãng lai',
          customerPhone: newPhone,
          serviceIds: [service!.id],
          startAt: futureDate(75),
        });
      expect(res.status).toBe(201);
      expect((res.body as { customerId: string | null }).customerId).toBeNull();
    });
  });

  describe('customer favorites', () => {
    it('rejects an unauthenticated request (401)', async () => {
      const res = await request(httpServer).get('/api/favorites');
      expect(res.status).toBe(401);
    });

    it('rejects a staff/admin session (403) — favorites are customer-only', async () => {
      const agent = request.agent(httpServer);
      await agent.post('/api/auth/login').send({ phone: '0900112233', password: 'change-me-123' });
      const res = await agent.get('/api/favorites');
      expect(res.status).toBe(403);
    });

    it('404s adding a nail design that does not exist', async () => {
      const agent = request.agent(httpServer);
      const login = await agent
        .post('/api/auth/login')
        .send({ phone: '0909111222', password: 'change-me-123' });
      const csrfToken = extractSetCookie(login, 'vi_nail_csrf_token');
      const res = await agent
        .post('/api/favorites/does-not-exist')
        .set('x-csrf-token', csrfToken);
      expect(res.status).toBe(404);
    });

    it('adds, lists (idempotently), and removes a favorite — scoped strictly to the caller', async () => {
      const design = await prisma.nailDesign.findFirst();
      expect(design).not.toBeNull();

      const agent = request.agent(httpServer);
      const login = await agent
        .post('/api/auth/login')
        .send({ phone: '0909111222', password: 'change-me-123' });
      const csrfToken = extractSetCookie(login, 'vi_nail_csrf_token');

      const add1 = await agent
        .post(`/api/favorites/${design!.id}`)
        .set('x-csrf-token', csrfToken);
      expect(add1.status).toBe(201);

      // Idempotent: favoriting an already-favorited design succeeds rather than conflicting.
      const add2 = await agent
        .post(`/api/favorites/${design!.id}`)
        .set('x-csrf-token', csrfToken);
      expect(add2.status).toBe(201);

      const list = await agent.get('/api/favorites');
      expect(list.status).toBe(200);
      const ids = (list.body as { id: string }[]).map((d) => d.id);
      expect(ids).toEqual([design!.id]);
      expect(ids.filter((id) => id === design!.id)).toHaveLength(1);

      // A second, unrelated customer must never see the first customer's favorites.
      const otherPhone = `09${Date.now().toString().slice(-8)}`;
      const otherAgent = request.agent(httpServer);
      await otherAgent
        .post('/api/auth/register')
        .send({ name: 'E2E Favorites Other', phone: otherPhone, password: 'change-me-123' });
      const otherList = await otherAgent.get('/api/favorites');
      expect(otherList.status).toBe(200);
      expect(otherList.body).toEqual([]);

      const remove = await agent
        .delete(`/api/favorites/${design!.id}`)
        .set('x-csrf-token', csrfToken);
      expect(remove.status).toBe(200);

      const listAfterRemove = await agent.get('/api/favorites');
      expect(listAfterRemove.body).toEqual([]);

      // Removing again (already gone) is a no-op, not an error.
      const removeAgain = await agent
        .delete(`/api/favorites/${design!.id}`)
        .set('x-csrf-token', csrfToken);
      expect(removeAgain.status).toBe(200);
    });
  });
});
