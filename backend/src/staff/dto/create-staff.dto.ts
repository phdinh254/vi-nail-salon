import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { VIETNAM_PHONE_REGEX } from '../../common/constants';
import { ShiftDto } from './shift.dto';

export class CreateStaffDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @Matches(VIETNAM_PHONE_REGEX, { message: 'Số điện thoại không hợp lệ.' })
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(1)
  role!: string;

  @IsString()
  bio!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  yearsExperience!: number;

  @IsArray()
  @IsString({ each: true })
  specialties!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftDto)
  shifts?: ShiftDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
