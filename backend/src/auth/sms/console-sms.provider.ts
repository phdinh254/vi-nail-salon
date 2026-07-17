import { Injectable, Logger } from '@nestjs/common';
import type { SmsProvider } from './sms-provider.interface';

/**
 * Provider SMS chỉ dùng cho môi trường phát triển: in mã OTP ra log server
 * thay vì gửi SMS thật. Chưa có tài khoản nhà cung cấp SMS/Zalo thật nên
 * KHÔNG gửi tin nhắn thật. Khi có tài khoản thật (vd. eSMS, Speedsms, Zalo
 * ZNS), tạo provider mới implement SmsProvider và đổi binding trong
 * AuthModule — phần còn lại của hệ thống không cần thay đổi.
 *
 * Production has NO way to opt into this provider — no environment flag, no override. If this
 * class is ever instantiated with NODE_ENV=production, the process refuses to start. That's
 * deliberate: an OTP code logged to server output in production is a credential leak, and the
 * fix is always "configure a real SmsProvider," never "silence the safety check."
 */
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name);

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ConsoleSmsProvider in mã OTP ra log — tuyệt đối không được chạy ở production dưới bất kỳ hình thức nào. ' +
          'Cấu hình một SmsProvider gửi SMS/Zalo ZNS thật và đổi binding trong AuthModule trước khi triển khai production.',
      );
    }
  }

  sendOtp(phone: string, code: string): Promise<void> {
    this.logger.warn(`[DEV ONLY] Mã OTP cho ${phone}: ${code} (chưa gửi SMS thật)`);
    return Promise.resolve();
  }
}
