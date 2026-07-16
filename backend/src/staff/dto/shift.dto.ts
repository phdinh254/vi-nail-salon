import { IsString, MinLength } from 'class-validator';

export class ShiftDto {
  @IsString()
  @MinLength(1)
  day!: string;

  @IsString()
  @MinLength(1)
  time!: string;
}
