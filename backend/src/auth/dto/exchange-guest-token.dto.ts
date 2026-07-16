import { IsString, MinLength } from 'class-validator';

export class ExchangeGuestTokenDto {
  @IsString()
  @MinLength(1)
  token!: string;
}
