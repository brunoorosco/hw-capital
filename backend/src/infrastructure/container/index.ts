import 'reflect-metadata';
import { container } from 'tsyringe';

// Repositories
import { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { PrismaAuditLogRepository } from '@infrastructure/database/prisma/repositories/PrismaAuditLogRepository';

// Registrar repositórios
container.registerSingleton<IAuditLogRepository>(
  'AuditLogRepository',
  PrismaAuditLogRepository
);

export { container };
