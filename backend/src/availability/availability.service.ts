import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AVAILABILITY_MAX_DAYS_AHEAD, AVAILABILITY_STEP_MINUTES, NON_BLOCKING_APPOINTMENT_STATUSES } from '../common/constants';
import { localDayOfWeek, localDayRangeUtc } from '../common/utils/timezone';
import { computeAvailableSlots, type StaffAvailabilityInput } from './availability.domain';
import type { AvailabilityQueryDto } from './dto/availability-query.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(query: AvailabilityQueryDto, now: Date = new Date()) {
    const serviceIds = query.serviceIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (serviceIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một dịch vụ.');
    }

    const services = await this.prisma.service.findMany({ where: { id: { in: serviceIds } } });
    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Một số dịch vụ không còn tồn tại.');
    }
    const durationMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);

    const { startUtc, endUtc } = localDayRangeUtc(query.date);
    const maxDate = new Date(now.getTime() + AVAILABILITY_MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
    if (startUtc.getTime() > maxDate.getTime()) {
      throw new BadRequestException(
        `Chỉ hỗ trợ xem lịch trống trong vòng ${AVAILABILITY_MAX_DAYS_AHEAD} ngày tới.`,
      );
    }

    // Candidate staff: active, and able to perform every requested service. If a specific
    // staffId was requested, narrow to just that one (still subject to the same eligibility
    // checks, so an ineligible or inactive staffId simply yields no slots rather than an error
    // — the frontend already filters the staff picker to eligible staff; this is defense in
    // depth against a stale/forged staffId, not the primary UX guard).
    const candidateStaff = await this.prisma.staffProfile.findMany({
      where: {
        isActive: true,
        id: query.staffId && query.staffId !== 'ANY' ? query.staffId : undefined,
      },
      include: { services: true, workingHours: true },
    });
    const eligibleStaff = candidateStaff.filter((staff) =>
      serviceIds.every((id) => staff.services.some((s) => s.serviceId === id)),
    );
    if (eligibleStaff.length === 0) {
      return { date: query.date, timezone: 'Asia/Ho_Chi_Minh', durationMinutes, slots: [] };
    }
    const staffIds = eligibleStaff.map((s) => s.id);

    const dayOfWeek = localDayOfWeek(query.date);

    const [timeOffs, appointments] = await Promise.all([
      this.prisma.timeOffRequest.findMany({
        where: {
          staffId: { in: staffIds },
          status: 'APPROVED',
          startDate: { lt: endUtc },
          endDate: { gt: startUtc },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          staffId: { in: staffIds },
          status: { notIn: NON_BLOCKING_APPOINTMENT_STATUSES },
          startAt: { lt: endUtc },
          endAt: { gt: startUtc },
        },
        select: { staffId: true, startAt: true, endAt: true },
      }),
    ]);

    const staffInputs: StaffAvailabilityInput[] = eligibleStaff.map((staff) => ({
      staffId: staff.id,
      workingWindows: staff.workingHours
        .filter((wh) => wh.dayOfWeek === dayOfWeek)
        .map((wh) => ({ startMinute: wh.startMinute, endMinute: wh.endMinute })),
      busy: [
        ...timeOffs
          .filter((t) => t.staffId === staff.id)
          .map((t) => ({ startAt: t.startDate, endAt: t.endDate })),
        ...appointments
          .filter((a) => a.staffId === staff.id)
          .map((a) => ({ startAt: a.startAt, endAt: a.endAt })),
      ],
    }));

    const slots = computeAvailableSlots({
      dateStr: query.date,
      durationMinutes,
      stepMinutes: AVAILABILITY_STEP_MINUTES,
      now,
      staff: staffInputs,
    });

    return {
      date: query.date,
      timezone: 'Asia/Ho_Chi_Minh',
      durationMinutes,
      slots: slots.map((s) => ({
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
        availableStaffIds: s.availableStaffIds,
      })),
    };
  }
}
