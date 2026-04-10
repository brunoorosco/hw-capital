import pino from 'pino';

const usePretty = process.env.LOG_PRETTY === 'true';

export const logger = pino(
  { level: process.env.LOG_LEVEL || 'info' },
  usePretty
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: false,
          translateTime: 'dd/mm/yyyy HH:MM:ss',
          ignore: 'pid,hostname,method,url,statusCode,duration,ip,userAgent,reqId',
          messageFormat: '[{reqId}] {msg}',
        },
      })
    : undefined
);