import { injectable } from 'tsyringe';
import { PrismaClient } from '../PrismaClient';
import { IAuditLogRepository, CreateAuditLogDTO } from '@domain/repositories/IAuditLogRepository';
import { AuditLog } from '@domain/entities/AuditLog';

@injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  private prisma = PrismaClient.getInstance();

  async create(data: CreateAuditLogDTO): Promise<AuditLog> {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action as any,
        entity: data.entity,
        entityId: data.entityId,
        method: data.method as any,
        endpoint: data.endpoint,
        payload: data.payload || null,
        oldData: data.oldData || null,
        newData: data.newData || null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        statusCode: data.statusCode,
        error: data.error,
      },
    });

    return new AuditLog(auditLog as any);
  }

  async findByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return logs.map(log => new AuditLog(log as any));
  }

  async findByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return logs.map(log => new AuditLog(log as any));
  }

  async findRecent(limit: number = 100): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return logs.map(log => new AuditLog(log as any));
  }
}
