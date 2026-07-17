import { IsOptional, IsString, Matches } from 'class-validator';

export class AvailabilityQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date phải theo định dạng YYYY-MM-DD.' })
  date!: string;

  /** Comma-separated service ids, e.g. "svc1,svc2". */
  @IsString()
  serviceIds!: string;

  @IsOptional()
  @IsString()
  staffId?: string;
}
