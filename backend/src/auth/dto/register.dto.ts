import { IsString, Matches, MinLength } from 'class-validator';
import { VIETNAM_PHONE_REGEX } from '../../common/constants';

export class RegisterDto {
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập họ tên.' })
  name!: string;

  @IsString()
  @Matches(VIETNAM_PHONE_REGEX, { message: 'Số điện thoại không hợp lệ.' })
  phone!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu cần tối thiểu 6 ký tự.' })
  password!: string;
}
