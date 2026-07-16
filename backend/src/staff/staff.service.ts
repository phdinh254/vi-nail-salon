import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

const staffInclude = {
  user: { select: { id: true, name: true, phone: true } },
  services: { include: { service: true } },
  shifts: true,
};

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.staffProfile.findMany({
      include: staffInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { id },
      include: staffInclude,
    });
    if (!staff) throw new NotFoundException('Không tìm thấy nhân viên.');
    return staff;
  }

  async create(dto: CreateStaffDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Số điện thoại đã được sử dụng.');

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: dto.name, phone: dto.phone, passwordHash, role: UserRole.STAFF },
      });
      const staff = await tx.staffProfile.create({
        data: {
          userId: user.id,
          role: dto.role,
          bio: dto.bio,
          yearsExperience: dto.yearsExperience,
          specialties: dto.specialties,
          isActive: dto.isActive ?? true,
          services: dto.serviceIds
            ? { create: dto.serviceIds.map((serviceId) => ({ serviceId })) }
            : undefined,
          shifts: dto.shifts ? { create: dto.shifts } : undefined,
        },
        include: staffInclude,
      });
      return staff;
    });
  }

  async update(id: string, dto: UpdateStaffDto) {
    await this.findById(id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.serviceIds) {
        await tx.staffService.deleteMany({ where: { staffId: id } });
        await tx.staffService.createMany({
          data: dto.serviceIds.map((serviceId) => ({ staffId: id, serviceId })),
        });
      }
      if (dto.shifts) {
        await tx.staffShift.deleteMany({ where: { staffId: id } });
        await tx.staffShift.createMany({
          data: dto.shifts.map((shift) => ({ staffId: id, day: shift.day, time: shift.time })),
        });
      }

      return tx.staffProfile.update({
        where: { id },
        data: {
          role: dto.role,
          bio: dto.bio,
          yearsExperience: dto.yearsExperience,
          specialties: dto.specialties,
          isActive: dto.isActive,
        },
        include: staffInclude,
      });
    });
  }

  async remove(id: string) {
    const staff = await this.findById(id);
    await this.prisma.user.delete({ where: { id: staff.userId } });
    return { deleted: true };
  }
}
