export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export class AuditLog {
  id: string;
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId: string;
  method: HttpMethod;
  endpoint: string;
  payload?: any;
  oldData?: any;
  newData?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode?: number | null;
  error?: string | null;
  createdAt: Date;

  constructor(props: AuditLog) {
    Object.assign(this, props);
  }
}
