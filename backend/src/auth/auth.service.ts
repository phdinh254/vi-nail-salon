import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACCESS_TOKEN_TTL_MINUTES,
  BOOKING_SESSION_TTL_MINUTES,
  GUEST_ACCESS_TOKEN_TTL_MINUTES,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_MINUTES,
  REFRESH_TOKEN_TTL_DAYS,
} from '../common/constants';
import { SMS_PROVIDER, type SmsProvider } from './sms/sms-provider.interface';
import { normalizeVietnamesePhone } from '../common/utils/phone';
import { hashToken } from '../common/utils/crypto';
import type { BookingSessionPayload, GuestAppointmentPayload, JwtPayload } from './jwt.types';

export type TokenPair = {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  csrfToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
  ) {}

  private signAccessToken(user: { id: string; phone: string; name: string; role: UserRole }) {
    const payload: JwtPayload = { sub: user.id, phone: user.phone, name: user.name, role: user.role };
    return this.jwt.sign(payload, { expiresIn: `${ACCESS_TOKEN_TTL_MINUTES}m` });
  }

  /** Issues a fresh access+refresh+CSRF token triple and persists the refresh token's hash. */
  private async issueTokenPair(
    user: { id: string; phone: string; name: string; role: UserRole },
    replacesTokenId?: string,
  ): Promise<TokenPair> {
    const accessToken = this.signAccessToken(user);
    const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MINUTES * 60 * 1000);

    const rawRefreshToken = randomBytes(32).toString('base64url');
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    const created = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawRefreshToken),
        expiresAt: refreshTokenExpiresAt,
      },
    });

    if (replacesTokenId) {
      await this.prisma.refreshToken.update({
        where: { id: replacesTokenId },
        data: { replacedByTokenId: created.id },
      });
    }

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt,
      csrfToken: randomBytes(24).toString('base64url'),
    };
  }

  private async assertActiveUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Tài khoản không còn tồn tại.');
    if (!user.isActive) throw new ForbiddenException('Tài khoản đã bị khóa.');
    return user;
  }

  async login(phoneInput: string, password: string): Promise<{ user: JwtPayload } & TokenPair> {
    const phone = normalizeVietnamesePhone(phoneInput);
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng.');
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng.');
    if (!user.isActive) throw new ForbiddenException('Tài khoản đã bị khóa.');

    const tokens = await this.issueTokenPair(user);
    return {
      user: { sub: user.id, name: user.name, phone: user.phone, role: user.role },
      ...tokens,
    };
  }

  async registerCustomer(
    name: string,
    phoneInput: string,
    password: string,
  ): Promise<{ user: JwtPayload } & TokenPair> {
    const phone = normalizeVietnamesePhone(phoneInput);
    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing) throw new ConflictException('Số điện thoại đã được đăng ký.');

    const passwordHash = await argon2.hash(password);
    const user = await this.prisma.user.create({
      data: { name, phone, passwordHash, role: UserRole.CUSTOMER },
    });

    const tokens = await this.issueTokenPair(user);
    return {
      user: { sub: user.id, name: user.name, phone: user.phone, role: user.role },
      ...tokens,
    };
  }

  /**
   * Rotates the refresh token. If a token that was already revoked (i.e. already used once
   * for rotation, or explicitly revoked by logout) is presented again, that's a reuse
   * signal — the credential was likely stolen — so every refresh token for that user is
   * revoked immediately, forcing a fresh login everywhere.
   */
  async refresh(rawRefreshToken: string): Promise<{ user: JwtPayload } & TokenPair> {
    const tokenHash = hashToken(rawRefreshToken);
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!record) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');

    if (record.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại.');
    }
    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    }

    const user = await this.assertActiveUser(record.userId);

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokenPair(user, record.id);
    return {
      user: { sub: user.id, name: user.name, phone: user.phone, role: user.role },
      ...tokens,
    };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    const tokenHash = hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async requestOtp(phoneInput: string) {
    const phone = normalizeVietnamesePhone(phoneInput);
    const cooldownStart = new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000);
    const recent = await this.prisma.otpChallenge.findFirst({
      where: { phone, purpose: 'BOOKING_VERIFY', createdAt: { gt: cooldownStart } },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) {
      throw new BadRequestException('Vui lòng đợi trước khi yêu cầu gửi lại mã.');
    }

    const code = randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
    const codeHash = await argon2.hash(code);
    await this.prisma.otpChallenge.create({
      data: {
        phone,
        codeHash,
        purpose: 'BOOKING_VERIFY',
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
      },
    });

    await this.sms.sendOtp(phone, code);
    return { sent: true, expiresInSeconds: OTP_TTL_MINUTES * 60 };
  }

  async verifyOtp(phoneInput: string, code: string) {
    const phone = normalizeVietnamesePhone(phoneInput);
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phone, purpose: 'BOOKING_VERIFY', consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge) throw new BadRequestException('Không tìm thấy mã xác minh, vui lòng gửi lại mã mới.');
    if (challenge.expiresAt < new Date()) throw new BadRequestException('Mã xác minh đã hết hạn.');
    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestException('Vượt quá số lần thử cho phép, vui lòng gửi lại mã mới.');
    }

    const valid = await argon2.verify(challenge.codeHash, code);
    if (!valid) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Mã xác minh không đúng.');
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    const payload: BookingSessionPayload = { purpose: 'BOOKING_SESSION', phone };
    const bookingSessionToken = this.jwt.sign(payload, {
      expiresIn: `${BOOKING_SESSION_TTL_MINUTES}m`,
    });
    return { bookingSessionToken };
  }

  verifyBookingSessionToken(token: string): BookingSessionPayload {
    try {
      const payload = this.jwt.verify<BookingSessionPayload>(token);
      if (payload.purpose !== 'BOOKING_SESSION') throw new Error('invalid purpose');
      return payload;
    } catch {
      throw new UnauthorizedException('Phiên xác minh không hợp lệ hoặc đã hết hạn.');
    }
  }

  async issueGuestAccessToken(appointmentId: string) {
    const rawToken = randomBytes(32).toString('base64url');
    await this.prisma.guestAccessToken.create({
      data: {
        appointmentId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + GUEST_ACCESS_TOKEN_TTL_MINUTES * 60 * 1000),
      },
    });
    return rawToken;
  }

  async exchangeGuestAccessToken(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const record = await this.prisma.guestAccessToken.findUnique({ where: { tokenHash } });
    if (!record) return { ok: false as const, reason: 'invalid' as const };
    if (record.usedAt) return { ok: false as const, reason: 'used' as const };
    if (record.expiresAt < new Date()) return { ok: false as const, reason: 'expired' as const };

    await this.prisma.guestAccessToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: record.appointmentId },
      select: { code: true, customerPhone: true },
    });

    const payload: GuestAppointmentPayload = {
      purpose: 'GUEST_APPOINTMENT',
      appointmentId: record.appointmentId,
    };
    const guestToken = this.jwt.sign(payload, { expiresIn: '30m' });
    return {
      ok: true as const,
      guestToken,
      appointmentId: record.appointmentId,
      code: appointment?.code,
      phone: appointment?.customerPhone,
    };
  }
}
