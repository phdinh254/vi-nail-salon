import { IsDateString, IsString, Matches } from 'class-validator';
import { VIETNAM_PHONE_REGEX } from '../../common/constants';

export class GuestLookupQuery {
  @IsString()
  code!: string;

  @IsString()
  @Matches(VIETNAM_PHONE_REGEX, { message: 'Số điện thoại không hợp lệ.' })
  phone!: string;
}

export class GuestRescheduleDto extends GuestLookupQuery {
  @IsDateString()
  startAt!: string;
}
