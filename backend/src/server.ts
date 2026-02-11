import 'reflect-metadata';
import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { router } from './infrastructure/http/routes';
import { errorHandler } from './infrastructure/http/middlewares/errorHandler';
import { auditMiddleware } from './infrastructure/http/middlewares/auditMiddleware';
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

// Audit middleware (antes das rotas)
app.use(auditMiddleware);

// Routes
app.use('/api', router);

// Error handler (sempre por último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});
