import { Controller, ForbiddenException, Get, Headers, NotFoundException, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { TEST_SECRET_HEADER } from '../common/constants';
import { TestSmsProvider } from '../auth/sms/test.sms-provider';

/**
 * Test-only: hands back the plaintext OTP an E2E test just requested, so Playwright can
 * complete the real guest-booking flow without scraping server logs or hard-coding a shared
 * code. Only ever registered when NODE_ENV=test (see TestingModule / AppModule) — the route
 * does not exist at all in development or production, so it 404s there by construction
 * rather than by a runtime check. Still requires a dedicated TEST_SECRET header (distinct
 * from JWT_SECRET) as a second layer, in case a misconfigured deploy ever sets NODE_ENV=test.
 */
@Controller('test-only')
export class TestOnlyController {
  constructor(private readonly testSms: TestSmsProvider) {}

  @Public()
  @SkipThrottle()
  @Get('otp')
  getOtp(@Query('phone') phone: string, @Headers(TEST_SECRET_HEADER) providedSecret?: string) {
    const expectedSecret = process.env.TEST_SECRET;
    if (!expectedSecret || providedSecret !== expectedSecret) {
      // Same response whether the route is genuinely absent or the secret is wrong —
      // don't reveal that this endpoint exists to an unauthenticated caller.
      throw new NotFoundException();
    }
    if (!phone) throw new ForbiddenException('Thiếu số điện thoại.');

    const code = this.testSms.takeCode(phone);
    if (!code) throw new NotFoundException('Không có mã OTP nào đang chờ cho số này.');
    return { code };
  }
}
