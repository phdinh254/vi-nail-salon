import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createForCustomer(customerId: string, customerName: string, dto: CreateReviewDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { services: true, reviews: true },
    });
    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn.');
    if (appointment.customerId !== customerId) {
      throw new ForbiddenException('Bạn không thể đánh giá lịch hẹn này.');
    }
    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('Chỉ có thể đánh giá sau khi dịch vụ đã hoàn thành.');
    }
    if (appointment.reviews.length > 0) {
      throw new BadRequestException('Lịch hẹn này đã được đánh giá.');
    }

    return this.prisma.review.create({
      data: {
        appointmentId: appointment.id,
        customerId,
        customerName,
        rating: dto.rating,
        content: dto.content,
        serviceName: appointment.services.map((s) => s.serviceName).join(', '),
        isVerified: true,
      },
    });
  }

  async remove(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Không tìm thấy đánh giá.');
    await this.prisma.review.delete({ where: { id } });
    return { deleted: true };
  }
}
