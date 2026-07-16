import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNailDesignDto } from './dto/create-nail-design.dto';
import { UpdateNailDesignDto } from './dto/update-nail-design.dto';

@Injectable()
export class NailDesignsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.nailDesign.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const design = await this.prisma.nailDesign.findUnique({ where: { id } });
    if (!design) throw new NotFoundException('Không tìm thấy mẫu nail.');
    return design;
  }

  create(dto: CreateNailDesignDto) {
    return this.prisma.nailDesign.create({ data: dto });
  }

  async update(id: string, dto: UpdateNailDesignDto) {
    await this.findById(id);
    return this.prisma.nailDesign.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.nailDesign.delete({ where: { id } });
    return { deleted: true };
  }
}
