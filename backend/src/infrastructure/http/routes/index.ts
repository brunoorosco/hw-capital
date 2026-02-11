import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { clientRoutes } from './client.routes';
import { reconciliationRoutes } from './reconciliation.routes';
import { cashflowRoutes } from './cashflow.routes';
import { planRouter } from './plan.routes';
import { userRouter } from './user.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/reconciliations', reconciliationRoutes);
router.use('/cashflow', cashflowRoutes);
router.use('/plans', planRouter);
router.use('/users', userRouter);
// router.use('/files', fileRoutes);
// router.use('/audit', auditRoutes);

export { router };
