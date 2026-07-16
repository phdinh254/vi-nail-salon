import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentStatus, CreatedVia, UserRole } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { AuthService } from '../auth/auth.service';
import { CreateGuestAppointmentDto } from './dto/create-guest-appointment.dto';
import { CreateStaffAppointmentDto } from './dto/create-staff-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { GuestLookupQuery, GuestRescheduleDto } from './dto/guest-lookup.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.types';

function extractBearerToken(authorization?: string): string {
  const [scheme, token] = (authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedException('Thiếu phiên xác minh OTP.');
  }
  return token;
}

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('guest')
  async createGuest(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: CreateGuestAppointmentDto,
  ) {
    const token = extractBearerToken(authorization);
    const { phone } = this.authService.verifyBookingSessionToken(token);
    return this.appointmentsService.createFromGuest(phone, dto);
  }

  @Public()
  @Get('lookup')
  lookup(@Query() query: GuestLookupQuery) {
    return this.appointmentsService.findByCodeAndPhone(query.code, query.phone);
  }

  @Public()
  @Patch('guest/reschedule')
  guestReschedule(@Body() dto: GuestRescheduleDto) {
    return this.appointmentsService.guestReschedule(dto.code, dto.phone, dto.startAt);
  }

  @Public()
  @Patch('guest/cancel')
  guestCancel(@Body() dto: GuestLookupQuery) {
    return this.appointmentsService.guestCancel(dto.code, dto.phone);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @Post('staff')
  createByStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStaffAppointmentDto,
  ) {
    const createdVia = user.role === UserRole.ADMIN ? CreatedVia.ADMIN : CreatedVia.STAFF;
    return this.appointmentsService.createFromStaff(dto, createdVia);
  }

  @Roles(UserRole.CUSTOMER)
  @Get('customer/me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.appointmentsService.findAllForCustomer(user.id);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: AppointmentStatus,
    @Query('staffId') staffId?: string,
  ) {
    if (user.role === UserRole.STAFF) {
      return this.appointmentsService.findAllForStaffUser(user.id);
    }
    return this.appointmentsService.findAllForAdmin({ status, staffId });
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.CUSTOMER)
  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const appointment = await this.appointmentsService.findById(id);
    if (user.role === UserRole.CUSTOMER && appointment.customerId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem lịch hẹn này.');
    }
    if (user.role === UserRole.STAFF) {
      const owned = await this.appointmentsService.findAllForStaffUser(user.id);
      if (!owned.some((a) => a.id === appointment.id)) {
        throw new ForbiddenException('Bạn chỉ được xem lịch hẹn được phân công cho mình.');
      }
    }
    return appointment;
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, dto.status, dto.note, user);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/assign')
  assignStaff(@Param('id') id: string, @Body() dto: AssignStaffDto) {
    return this.appointmentsService.assignStaff(id, dto.staffId);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @Post(':id/guest-access')
  async issueGuestAccess(@Param('id') id: string) {
    await this.appointmentsService.findById(id);
    const token = await this.authService.issueGuestAccessToken(id);
    return { token };
  }
}
