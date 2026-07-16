import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  appointmentId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
