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

  constructor() {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_CONSOLE_SMS_IN_PROD !== 'true') {
      throw new Error(
        'ConsoleSmsProvider in chọn mã OTP ra log — không được dùng ở production. ' +
          'Cấu hình một SmsProvider gửi SMS/Zalo ZNS thật, hoặc đặt ALLOW_CONSOLE_SMS_IN_PROD=true nếu đây thực sự là môi trường demo/UAT nội bộ, có kiểm soát truy cập log chặt chẽ.',
      );
    }
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    this.logger.warn(`[DEV ONLY] Mã OTP cho ${phone}: ${code} (chưa gửi SMS thật)`);
  }
}
