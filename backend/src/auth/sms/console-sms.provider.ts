import { Injectable, Logger } from '@nestjs/common';
import type { SmsProvider } from './sms-provider.interface';

/**
 * Provider SMS chỉ dùng cho môi trường phát triển: in mã OTP ra log server
 * thay vì gửi SMS thật. Chưa có tài khoản nhà cung cấp SMS/Zalo thật nên
 * KHÔNG gửi tin nhắn thật. Khi có tài khoản thật (vd. eSMS, Speedsms, Zalo
 * ZNS), tạo provider mới implement SmsProvider và đổi binding trong
 * AuthModule — phần còn lại của hệ thống không cần thay đổi.
 */
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name);

  async sendOtp(phone: string, code: string): Promise<void> {
    this.logger.warn(`[DEV ONLY] Mã OTP cho ${phone}: ${code} (chưa gửi SMS thật)`);
  }
}
