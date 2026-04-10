import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    err: pino.stdSerializers.err,
  },

  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'dd/mm/yyyy HH:MM:ss',
        ignore: 'pid,hostname,reqId,method,url,statusCode,duration,ip,userAgent',
        messageFormat: '{msg}',  // só a mensagem, sem [pid]
        singleLine: false,
      },
    },
  }),
});