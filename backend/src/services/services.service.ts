import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(category?: ServiceCategory) {
    return this.prisma.service.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findUnique({ where: { slug } });
    if (!service) throw new NotFoundException('Không tìm thấy dịch vụ.');
    return service;
  }

  async findById(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Không tìm thấy dịch vụ.');
    return service;
  }

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findById(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.service.delete({ where: { id } });
    return { deleted: true };
  }
}
