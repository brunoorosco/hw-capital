import 'reflect-metadata';
import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { router } from './infrastructure/http/routes';
import { errorHandler } from './infrastructure/http/middlewares/errorHandler';
import { auditMiddleware } from './infrastructure/http/middlewares/auditMiddleware';
import { loggerMiddleware } from './infrastructure/http/middlewares/loggerMiddleware';
import { logger } from './infrastructure/logger';
import './infrastructure/container';

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware (antes de tudo)
app.use(loggerMiddleware);

// Audit middleware (antes das rotas)
app.use(auditMiddleware);

// Routes
app.use('/api', router);

// Error handler (sempre por último)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);
  logger.info(`💚 Health check: http://localhost:${PORT}/api/health`);
});
