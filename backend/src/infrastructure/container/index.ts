import 'reflect-metadata';
import { container } from 'tsyringe';

// Repositories
import { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { PrismaAuditLogRepository } from '@infrastructure/database/prisma/repositories/PrismaAuditLogRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { PrismaUserRepository } from '@infrastructure/database/prisma/repositories/PrismaUserRepository';

// Use Cases
import { LoginGoogleUsecase } from '@domain/use-cases/auth/google';

// Registrar repositórios
container.registerSingleton<IAuditLogRepository>(
  'AuditLogRepository',
  PrismaAuditLogRepository
);

container.registerSingleton<IUserRepository>(
  'PrismaUserRepository',
  PrismaUserRepository
);

// Registrar use-cases
container.registerSingleton<LoginGoogleUsecase>(
  'LoginGoogleUsecase',
  LoginGoogleUsecase
);

export { container };
