import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: dto });
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Không tìm thấy thông báo.');
    if (notification.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật thông báo này.');
    }
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }
}
