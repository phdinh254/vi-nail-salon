import { IsString, Length, Matches } from 'class-validator';
import { VIETNAM_PHONE_REGEX } from '../../common/constants';

export class VerifyOtpDto {
  @IsString()
  @Matches(VIETNAM_PHONE_REGEX, { message: 'Số điện thoại không hợp lệ.' })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: 'Mã xác minh gồm 6 chữ số.' })
  code!: string;
}
