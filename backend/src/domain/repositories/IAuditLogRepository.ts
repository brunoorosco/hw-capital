import { AuditLog } from '../entities/AuditLog';

export interface CreateAuditLogDTO {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  method: string;
  endpoint: string;
  payload?: any;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
  error?: string;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogDTO): Promise<AuditLog>;
  findByEntity(entity: string, entityId: string): Promise<AuditLog[]>;
  findByUser(userId: string, limit?: number): Promise<AuditLog[]>;
  findRecent(limit?: number): Promise<AuditLog[]>;
}
