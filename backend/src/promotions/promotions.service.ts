import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activeOnly?: boolean) {
    return this.prisma.promotion.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { validFrom: 'desc' },
    });
  }

  async findById(id: string) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) throw new NotFoundException('Không tìm thấy chương trình ưu đãi.');
    return promotion;
  }

  create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({ data: dto });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.findById(id);
    return this.prisma.promotion.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.promotion.delete({ where: { id } });
    return { deleted: true };
  }
}
