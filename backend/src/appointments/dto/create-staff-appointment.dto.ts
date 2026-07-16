import { IsString, Matches } from 'class-validator';
import { VIETNAM_PHONE_REGEX } from '../../common/constants';
import { CreateGuestAppointmentDto } from './create-guest-appointment.dto';

export class CreateStaffAppointmentDto extends CreateGuestAppointmentDto {
  @IsString()
  @Matches(VIETNAM_PHONE_REGEX, { message: 'Số điện thoại không hợp lệ.' })
  customerPhone!: string;
}
