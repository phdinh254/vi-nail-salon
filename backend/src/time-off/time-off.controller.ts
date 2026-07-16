import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { TimeOffService } from './time-off.service';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { UpdateTimeOffStatusDto } from './dto/update-time-off-status.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.types';

@Controller('time-off')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Roles(UserRole.STAFF)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTimeOffDto) {
    return this.timeOffService.createForUser(user.id, dto);
  }

  @Roles(UserRole.STAFF)
  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.timeOffService.findMine(user.id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.timeOffService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTimeOffStatusDto) {
    return this.timeOffService.updateStatus(id, dto.status);
  }
}
