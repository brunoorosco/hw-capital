import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../../logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const reqId = randomUUID();

  // Child logger carrega o reqId em todos os logs desse ciclo
  const reqLogger = logger.child({ reqId });

  // Expõe o logger no req para uso nos controllers
  (req as any).log = reqLogger;

  reqLogger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, `→ ${req.method} ${req.url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,        // número é melhor que string para métricas/queries
      ip: req.ip,
    };

    // 5xx = erro do servidor, 4xx = erro do cliente (warn), 2xx/3xx = info
    if (res.statusCode >= 500) {
      reqLogger.error(logData, `← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    } else if (res.statusCode >= 400) {
      reqLogger.warn(logData, `← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    } else {
      reqLogger.info(logData, `← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    }
  });

  next();
};