import { Injectable } from '@nestjs/common';
import { ActorRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type RecordInput = {
  actorId?: string;
  actorName: string;
  actorRole: ActorRole;
  action: string;
  resourceType: string;
  resourceLabel: string;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  record(input: RecordInput) {
    return this.prisma.auditLog.create({ data: input });
  }

  findAll(filters: { actorRole?: ActorRole; action?: string; resourceType?: string }) {
    return this.prisma.auditLog.findMany({
      where: {
        actorRole: filters.actorRole,
        action: filters.action ? { contains: filters.action, mode: 'insensitive' } : undefined,
        resourceType: filters.resourceType,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
