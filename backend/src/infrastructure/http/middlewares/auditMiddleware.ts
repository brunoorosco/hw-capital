import { Request, Response, NextFunction } from 'express';
import { container } from '@infrastructure/container';
import { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  // Só audita POST, PUT, PATCH e DELETE
  const methodsToAudit = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (!methodsToAudit.includes(req.method)) {
    return next();
  }

  // Capturar dados originais do response
  const originalSend = res.send;
  const originalJson = res.json;

  let responseData: any;

  // Interceptar res.json
  res.json = function (data: any) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Interceptar res.send
  res.send = function (data: any) {
    responseData = data;
    return originalSend.call(this, data);
  };

  // Após o response ser enviado
  res.on('finish', async () => {
    try {
      const auditLogRepository = container.resolve<IAuditLogRepository>('AuditLogRepository');

      // Extrair informações da requisição
      const userId = (req as any).user?.id; // Usuário autenticado (se houver)
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      // Determinar entidade e entityId do path
      const pathParts = req.path.split('/').filter(Boolean);
      const entity = pathParts[1] || 'unknown'; // ex: /api/clients -> clients
      const entityId = pathParts[2] || 'bulk'; // ID se houver

      // Determinar ação baseada no método
      let action = 'CREATE';
      if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
      if (req.method === 'DELETE') action = 'DELETE';

      // Criar log de auditoria
      await auditLogRepository.create({
        userId,
        action,
        entity,
        entityId,
        method: req.method,
        endpoint: req.originalUrl,
        payload: req.body,
        newData: responseData,
        ipAddress,
        userAgent,
        statusCode: res.statusCode,
        error: res.statusCode >= 400 ? JSON.stringify(responseData) : undefined,
      });
    } catch (error) {
      console.error('Erro ao criar audit log:', error);
      // Não interrompe a requisição se falhar a auditoria
    }
  });

  next();
}
