import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SmsProvider } from './sms-provider.interface';

const ESMS_ENDPOINT = 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/';

/**
 * SmsType=8 is eSMS.vn's dedicated OTP channel (routed over their OTP brandname,
 * higher delivery priority than the regular SmsType=2 CSKH channel).
 * https://esms.vn/tai-lieu-api
 */
const OTP_SMS_TYPE = '8';

type EsmsResponse = {
  CodeResult: string;
  ErrorMessage?: string;
  SMSID?: string;
};

/**
 * Production SmsProvider backed by eSMS.vn. Requires ESMS_API_KEY and ESMS_SECRET_KEY;
 * ESMS_BRANDNAME is optional (falls back to eSMS's default OTP brandname for the account).
 */
@Injectable()
export class EsmsProvider implements SmsProvider {
  private readonly logger = new Logger(EsmsProvider.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly brandname?: string;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('ESMS_API_KEY');
    this.secretKey = config.getOrThrow<string>('ESMS_SECRET_KEY');
    this.brandname = config.get<string>('ESMS_BRANDNAME');
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    const response = await fetch(ESMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ApiKey: this.apiKey,
        SecretKey: this.secretKey,
        Phone: phone,
        Content: `Ma xac thuc Vi Nail Salon cua ban la: ${code}. Ma co hieu luc trong it phut, vui long khong chia se cho bat ky ai.`,
        SmsType: OTP_SMS_TYPE,
        IsUnicode: '0',
        ...(this.brandname ? { Brandname: this.brandname } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`eSMS.vn HTTP ${response.status}: gửi OTP thất bại.`);
    }

    const result = (await response.json()) as EsmsResponse;
    if (result.CodeResult !== '100') {
      this.logger.error(`eSMS.vn từ chối gửi OTP (CodeResult=${result.CodeResult}): ${result.ErrorMessage ?? 'unknown error'}`);
      throw new Error('Không thể gửi mã OTP qua SMS. Vui lòng thử lại sau.');
    }
  }
}
