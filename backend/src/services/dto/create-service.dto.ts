import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ServiceCategory } from '@prisma/client';

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(ServiceCategory)
  category!: ServiceCategory;

  @IsString()
  shortDescription!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceFrom!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceTo?: number;

  @IsBoolean()
  isFixedPrice!: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
