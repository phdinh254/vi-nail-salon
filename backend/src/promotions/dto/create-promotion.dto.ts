import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  discountLabel!: string;

  @IsDateString()
  validFrom!: string;

  @IsDateString()
  validTo!: string;

  @IsArray()
  @IsString({ each: true })
  conditions!: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
