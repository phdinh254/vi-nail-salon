import { IsString, Matches } from 'class-validator';
import { VIETNAM_PHONE_REGEX } from '../../common/constants';

export class RequestOtpDto {
  @IsString()
  @Matches(VIETNAM_PHONE_REGEX, { message: 'Số điện thoại không hợp lệ.' })
  phone!: string;
}
