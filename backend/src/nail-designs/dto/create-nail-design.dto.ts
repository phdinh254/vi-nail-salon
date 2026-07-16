import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { NailDesignStyle, NailDesignColor } from '@prisma/client';

export class CreateNailDesignDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(NailDesignStyle)
  style!: NailDesignStyle;

  @IsArray()
  @IsEnum(NailDesignColor, { each: true })
  colors!: NailDesignColor[];

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
}
