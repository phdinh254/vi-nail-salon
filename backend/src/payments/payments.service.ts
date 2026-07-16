import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.payment.findMany({
      include: { appointment: { select: { code: true, customerName: true } } },
      orderBy: { paidAt: 'desc' },
    });
  }

  create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({ data: { ...dto, status: PaymentStatus.PAID } });
  }

  async refund(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch.');
    return this.prisma.payment.update({ where: { id }, data: { status: PaymentStatus.REFUNDED } });
  }
}
