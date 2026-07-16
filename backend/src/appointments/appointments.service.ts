import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, CreatedVia, UserRole } from '@prisma/client';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { CreateGuestAppointmentDto } from './dto/create-guest-appointment.dto';
import type { CreateStaffAppointmentDto } from './dto/create-staff-appointment.dto';
import type { AuthenticatedUser } from '../auth/jwt.types';

const appointmentInclude = {
  services: true,
  timeline: { orderBy: { at: 'asc' as const } },
  staff: { include: { user: { select: { name: true } } } },
  nailDesign: true,
};

const CANCELLABLE_STATUSES: AppointmentStatus[] = ['PENDING_CONFIRMATION', 'CONFIRMED'];

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `VN-${randomInt(1000, 9999)}${randomInt(10, 99)}`;
      const existing = await this.prisma.appointment.findUnique({ where: { code: candidate } });
      if (!existing) return candidate;
    }
    throw new BadRequestException('Không thể tạo mã lịch hẹn, vui lòng thử lại.');
  }

  private async buildServiceLines(serviceIds: string[]) {
    if (serviceIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một dịch vụ.');
    }
    const services = await this.prisma.service.findMany({ where: { id: { in: serviceIds } } });
    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Một số dịch vụ không còn tồn tại.');
    }
    const lines = services.map((service) => ({
      serviceId: service.id,
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      price: service.priceFrom,
    }));
    const totalPrice = lines.reduce((sum, line) => sum + line.price, 0);
    const totalDurationMinutes = lines.reduce((sum, line) => sum + line.durationMinutes, 0);
    return { lines, totalPrice, totalDurationMinutes };
  }

  private async resolveStaffId(staffId: string | undefined): Promise<string | null> {
    if (!staffId || staffId === 'ANY') return null;
    const staff = await this.prisma.staffProfile.findUnique({ where: { id: staffId } });
    if (!staff) throw new BadRequestException('Nhân viên không tồn tại.');
    return staff.id;
  }

  async createFromGuest(
    phone: string,
    dto: CreateGuestAppointmentDto,
    createdVia: CreatedVia = CreatedVia.GUEST,
    customerId?: string,
  ) {
    const { lines, totalPrice, totalDurationMinutes } = await this.buildServiceLines(dto.serviceIds);
    const staffId = await this.resolveStaffId(dto.staffId);
    const startAt = new Date(dto.startAt);
    const endAt = new Date(startAt.getTime() + totalDurationMinutes * 60 * 1000);
    const code = await this.generateUniqueCode();

    return this.prisma.appointment.create({
      data: {
        code,
        status: AppointmentStatus.PENDING_CONFIRMATION,
        startAt,
        endAt,
        staffId,
        customerId,
        customerName: dto.customerName,
        customerPhone: phone,
        nailDesignId: dto.nailDesignId,
        allergyNote: dto.allergyNote,
        requestNote: dto.requestNote,
        totalPrice,
        totalDurationMinutes,
        createdVia,
        services: { create: lines },
        timeline: { create: { status: AppointmentStatus.PENDING_CONFIRMATION } },
      },
      include: appointmentInclude,
    });
  }

  createFromStaff(dto: CreateStaffAppointmentDto, createdVia: CreatedVia) {
    return this.createFromGuest(dto.customerPhone, dto, createdVia);
  }

  async findByCodeAndPhone(code: string, phone: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { code: code.toUpperCase(), customerPhone: phone },
      include: appointmentInclude,
    });
    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn.');
    return appointment;
  }

  async findById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude,
    });
    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn.');
    return appointment;
  }

  findAllForAdmin(filters: { status?: AppointmentStatus; staffId?: string }) {
    return this.prisma.appointment.findMany({
      where: { status: filters.status, staffId: filters.staffId },
      include: appointmentInclude,
      orderBy: { startAt: 'desc' },
    });
  }

  async findAllForStaffUser(userId: string) {
    const staff = await this.prisma.staffProfile.findUnique({ where: { userId } });
    if (!staff) throw new ForbiddenException('Tài khoản chưa gắn với hồ sơ nhân viên.');
    return this.findAllForAdmin({ staffId: staff.id });
  }

  findAllForCustomer(customerId: string) {
    return this.prisma.appointment.findMany({
      where: { customerId },
      include: appointmentInclude,
      orderBy: { startAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    note: string | undefined,
    actor?: AuthenticatedUser,
  ) {
    const appointment = await this.findById(id);
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status,
        timeline: { create: { status, note } },
      },
      include: appointmentInclude,
    });

    if (actor) {
      await this.auditLog.record({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role === UserRole.ADMIN ? 'ADMIN' : 'STAFF',
        action: `Cập nhật trạng thái lịch hẹn sang ${status}`,
        resourceType: 'Lịch hẹn',
        resourceLabel: appointment.code,
      });
    }

    return updated;
  }

  async assignStaff(id: string, staffId: string) {
    await this.findById(id);
    const staff = await this.prisma.staffProfile.findUnique({ where: { id: staffId } });
    if (!staff) throw new BadRequestException('Nhân viên không tồn tại.');
    return this.prisma.appointment.update({
      where: { id },
      data: { staffId },
      include: appointmentInclude,
    });
  }

  async guestReschedule(code: string, phone: string, startAt: string) {
    const appointment = await this.findByCodeAndPhone(code, phone);
    if (!CANCELLABLE_STATUSES.includes(appointment.status)) {
      throw new BadRequestException('Lịch hẹn hiện không thể đổi giờ.');
    }
    const nextStart = new Date(startAt);
    const nextEnd = new Date(nextStart.getTime() + appointment.totalDurationMinutes * 60 * 1000);
    return this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        startAt: nextStart,
        endAt: nextEnd,
        timeline: { create: { status: appointment.status, note: 'Khách tự đổi giờ hẹn.' } },
      },
      include: appointmentInclude,
    });
  }

  async guestCancel(code: string, phone: string) {
    const appointment = await this.findByCodeAndPhone(code, phone);
    if (!CANCELLABLE_STATUSES.includes(appointment.status)) {
      throw new BadRequestException('Lịch hẹn hiện không thể hủy.');
    }
    return this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        timeline: { create: { status: AppointmentStatus.CANCELLED, note: 'Khách tự hủy lịch.' } },
      },
      include: appointmentInclude,
    });
  }
}
