import { IsEnum } from 'class-validator';
import { TimeOffStatus } from '@prisma/client';

export class UpdateTimeOffStatusDto {
  @IsEnum(TimeOffStatus)
  status!: TimeOffStatus;
}
