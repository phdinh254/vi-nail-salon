import { Controller, Get, Query } from '@nestjs/common';
import { ActorRole, UserRole } from '@prisma/client';
import { AuditLogService } from './audit-log.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('audit-logs')
@Roles(UserRole.ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(
    @Query('actorRole') actorRole?: ActorRole,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
  ) {
    return this.auditLogService.findAll({ actorRole, action, resourceType });
  }
}
