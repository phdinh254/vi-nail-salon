import { IsEnum, IsString, MinLength } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;
}
