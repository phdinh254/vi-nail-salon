import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TimeOffStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeOffDto } from './dto/create-time-off.dto';

@Injectable()
export class TimeOffService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireStaffProfile(userId: string) {
    const staff = await this.prisma.staffProfile.findUnique({ where: { userId } });
    if (!staff) throw new ForbiddenException('Tài khoản chưa gắn với hồ sơ nhân viên.');
    return staff;
  }

  async createForUser(userId: string, dto: CreateTimeOffDto) {
    const staff = await this.requireStaffProfile(userId);
    return this.prisma.timeOffRequest.create({
      data: {
        staffId: staff.id,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
      },
    });
  }

  async findMine(userId: string) {
    const staff = await this.requireStaffProfile(userId);
    return this.prisma.timeOffRequest.findMany({
      where: { staffId: staff.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.timeOffRequest.findMany({
      include: { staff: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: TimeOffStatus) {
    const request = await this.prisma.timeOffRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu nghỉ phép.');
    return this.prisma.timeOffRequest.update({ where: { id }, data: { status } });
  }
}
