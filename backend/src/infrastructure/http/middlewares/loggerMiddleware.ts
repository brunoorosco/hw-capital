import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../../logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const reqId = randomUUID().split('-')[0]; // curto: "081d0c11" em vez do UUID completo

  const reqLogger = logger.child({ reqId });
  (req as any).log = reqLogger;

  reqLogger.info(`→ ${req.method} ${req.originalUrl}`); // sem objeto, só a mensagem

  res.on('finish', () => {
    const duration = Date.now() - start;
    const msg = `← ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      reqLogger.error(msg);
    } else if (res.statusCode >= 400) {
      reqLogger.warn(msg);
    } else {
      reqLogger.info(msg);
    }
  });

  next();
};