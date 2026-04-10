import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  // Serializers padronizam os campos antes de logar
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.remoteAddress ?? req.ip,
      userAgent: req.headers?.['user-agent'],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err, // stack trace limpo
  },

  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'dd/mm/yyyy HH:MM:ss',  // formato correto
      ignore: 'pid,hostname',
      messageFormat: '[{level}] {msg}',        // level em vez de levelLabel
      singleLine: false,
    },
  },
});