import { IsArray, IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGuestAppointmentDto {
  @IsString()
  @MinLength(1)
  customerName!: string;

  @IsArray()
  @IsString({ each: true })
  serviceIds!: string[];

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsDateString()
  startAt!: string;

  @IsOptional()
  @IsString()
  nailDesignId?: string;

  @IsOptional()
  @IsString()
  allergyNote?: string;

  @IsOptional()
  @IsString()
  requestNote?: string;
}
