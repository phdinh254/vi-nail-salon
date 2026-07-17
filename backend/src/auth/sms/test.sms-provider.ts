import { Injectable } from '@nestjs/common';
import type { SmsProvider } from './sms-provider.interface';

type MailboxEntry = { code: string; createdAt: number };

/**
 * Test-only SmsProvider: holds the plaintext OTP in an in-memory mailbox (never logged,
 * never persisted to the database — OtpChallenge only ever stores the argon2 hash) so the
 * test-only controller can hand it back to an E2E test. Only wired up when NODE_ENV=test
 * (see AuthModule) — this class is never reachable in development or production.
 */
@Injectable()
export class TestSmsProvider implements SmsProvider {
  private readonly mailbox = new Map<string, MailboxEntry>();

  sendOtp(phone: string, code: string): Promise<void> {
    this.mailbox.set(phone, { code, createdAt: Date.now() });
    return Promise.resolve();
  }

  /** Consumes (removes) the mailbox entry so a test can't read the same code twice. */
  takeCode(phone: string): string | null {
    const entry = this.mailbox.get(phone);
    if (!entry) return null;
    this.mailbox.delete(phone);
    return entry.code;
  }
}
