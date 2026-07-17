import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, CreatedVia, Prisma, UserRole } from '@prisma/client';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NON_BLOCKING_APPOINTMENT_STATUSES } from '../common/constants';
import { isValidStatusTransition } from './status-transitions';
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

  private assertFutureStartTime(startAt: Date) {
    if (startAt.getTime() <= Date.now()) {
      throw new BadRequestException('Vui lòng chọn khung giờ trong tương lai.');
    }
  }

  /** Chặn trùng lịch: cùng nhân viên, khoảng thời gian giao nhau, trạng thái vẫn còn hiệu lực. */
  /**
   * The app-level pre-check + Serializable transaction (P2034) catches almost every race, but
   * the `appointments_no_staff_overlap` EXCLUDE constraint (see migration 20260716182339) is
   * the actual final safety net — enforced by Postgres itself, unbypassable by any code path.
   * Prisma has no typed error code for exclusion-constraint violations: they surface as a
   * PrismaClientUnknownRequestError whose message embeds the raw Postgres error, including
   * code 23P01 (exclusion_violation) and the constraint name. Detect via the constraint name
   * rather than parsing the SQLSTATE out of free text, since that's the stable, intentional
   * part of the message. Map both cases to the same friendly 409 — never leak the raw DB error.
   */
  private rethrowAsConflictIfBookingRace(err: unknown): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === 'P2034' || err.code === 'P2004')) {
      throw new ConflictException('Khung giờ vừa được đặt bởi yêu cầu khác, vui lòng thử lại.');
    }
    if (
      err instanceof Prisma.PrismaClientUnknownRequestError &&
      err.message.includes('appointments_no_staff_overlap')
    ) {
      throw new ConflictException('Khung giờ vừa được đặt bởi yêu cầu khác, vui lòng thử lại.');
    }
    throw err;
  }

  private async assertNoStaffConflict(
    tx: Prisma.TransactionClient,
    staffId: string,
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string,
  ) {
    const conflict = await tx.appointment.findFirst({
      where: {
        staffId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: { notIn: NON_BLOCKING_APPOINTMENT_STATUSES },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });
    if (conflict) {
      throw new ConflictException('Khung giờ này đã có lịch hẹn khác cho nhân viên đã chọn.');
    }
  }

  async createFromGuest(
    phone: string,
    dto: CreateGuestAppointmentDto,
    createdVia: CreatedVia = CreatedVia.GUEST,
    customerId?: string,
    createdByUserId?: string,
  ) {
    const { lines, totalPrice, totalDurationMinutes } = await this.buildServiceLines(dto.serviceIds);
    const staffId = await this.resolveStaffId(dto.staffId);
    const startAt = new Date(dto.startAt);
    this.assertFutureStartTime(startAt);
    const endAt = new Date(startAt.getTime() + totalDurationMinutes * 60 * 1000);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          if (staffId) {
            await this.assertNoStaffConflict(tx, staffId, startAt, endAt);
          }
          const code = await this.generateUniqueCode();
          return tx.appointment.create({
            data: {
              code,
              status: AppointmentStatus.PENDING_CONFIRMATION,
              startAt,
              endAt,
              staffId,
              customerId,
              createdByUserId,
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
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      this.rethrowAsConflictIfBookingRace(err);
    }
  }

  async createFromStaff(dto: CreateStaffAppointmentDto, actor: AuthenticatedUser) {
    const createdVia = actor.role === UserRole.ADMIN ? CreatedVia.ADMIN : CreatedVia.STAFF;
    // Link to an existing customer account when this phone already has one — never create a
    // new login-capable account on the customer's behalf here (that would hand out a
    // password-less/unclaimable account, which is worse than just leaving it phone-only like
    // a normal guest booking).
    const existingCustomer = await this.prisma.user.findFirst({
      where: { phone: dto.customerPhone, role: UserRole.CUSTOMER },
    });
    const appointment = await this.createFromGuest(
      dto.customerPhone,
      dto,
      createdVia,
      existingCustomer?.id,
      actor.id,
    );

    await this.auditLog.record({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role === UserRole.ADMIN ? 'ADMIN' : 'STAFF',
      action: 'Tạo lịch hẹn hộ khách hàng',
      resourceType: 'Lịch hẹn',
      resourceLabel: appointment.code,
    });

    return appointment;
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
    if (!isValidStatusTransition(appointment.status, status)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${appointment.status} sang ${status}.`,
      );
    }
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
    const appointment = await this.findById(id);
    const staff = await this.prisma.staffProfile.findUnique({ where: { id: staffId } });
    if (!staff) throw new BadRequestException('Nhân viên không tồn tại.');

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          await this.assertNoStaffConflict(tx, staffId, appointment.startAt, appointment.endAt, id);
          return tx.appointment.update({
            where: { id },
            data: { staffId },
            include: appointmentInclude,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      this.rethrowAsConflictIfBookingRace(err);
    }
  }

  async guestReschedule(code: string, phone: string, startAt: string) {
    const appointment = await this.findByCodeAndPhone(code, phone);
    if (!CANCELLABLE_STATUSES.includes(appointment.status)) {
      throw new BadRequestException('Lịch hẹn hiện không thể đổi giờ.');
    }
    const nextStart = new Date(startAt);
    this.assertFutureStartTime(nextStart);
    const nextEnd = new Date(nextStart.getTime() + appointment.totalDurationMinutes * 60 * 1000);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          if (appointment.staffId) {
            await this.assertNoStaffConflict(tx, appointment.staffId, nextStart, nextEnd, appointment.id);
          }
          return tx.appointment.update({
            where: { id: appointment.id },
            data: {
              startAt: nextStart,
              endAt: nextEnd,
              timeline: { create: { status: appointment.status, note: 'Khách tự đổi giờ hẹn.' } },
            },
            include: appointmentInclude,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      this.rethrowAsConflictIfBookingRace(err);
    }
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
