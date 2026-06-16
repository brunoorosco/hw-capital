import { Router } from 'express';
import { SaasController } from '../controllers/SaasController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const saasRoutes = Router();
const saasController = new SaasController();

// Public routes
saasRoutes.get('/plans', (req, res) => saasController.listPlans(req, res));
saasRoutes.post('/webhook', (req, res) => saasController.webhook(req, res));

// Authenticated user routes
saasRoutes.get('/subscription', authMiddleware, (req, res) => saasController.mySubscription(req, res));
saasRoutes.post('/subscribe', authMiddleware, (req, res) => saasController.subscribe(req, res));
saasRoutes.post('/cancel', authMiddleware, (req, res) => saasController.cancelSubscription(req, res));
saasRoutes.get('/payments', authMiddleware, (req, res) => saasController.payments(req, res));

// Admin routes (require ADMIN role)
saasRoutes.get('/admin/plans', authMiddleware, adminMiddleware, (req, res) => saasController.adminListPlans(req, res));
saasRoutes.post('/admin/plans', authMiddleware, adminMiddleware, (req, res) => saasController.adminCreatePlan(req, res));
saasRoutes.put('/admin/plans/:id', authMiddleware, adminMiddleware, (req, res) => saasController.adminUpdatePlan(req, res));
saasRoutes.delete('/admin/plans/:id', authMiddleware, adminMiddleware, (req, res) => saasController.adminDeletePlan(req, res));
saasRoutes.get('/admin/payments', authMiddleware, adminMiddleware, (req, res) => saasController.adminListPayments(req, res));
saasRoutes.get('/admin/subscriptions', authMiddleware, adminMiddleware, (req, res) => saasController.adminListSubscriptions(req, res));

export { saasRoutes };
