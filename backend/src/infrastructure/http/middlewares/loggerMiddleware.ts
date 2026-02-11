import { Request, Response, NextFunction } from 'express';
import { logger } from '../../logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log da requisição
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, `→ ${req.method} ${req.url}`);

  // Capturar o término da resposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    if (res.statusCode >= 400) {
      logger.error(logData, `← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    } else {
      logger.info(logData, `← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    }
  });

  next();
};
