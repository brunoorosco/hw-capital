import { Router } from 'express';
import { SaasController } from '../controllers/SaasController';
import { authMiddleware } from '../middlewares/authMiddleware';

const saasRoutes = Router();
const saasController = new SaasController();

saasRoutes.get('/plans', (req, res) => saasController.listPlans(req, res));
saasRoutes.get('/subscription', authMiddleware, (req, res) => saasController.mySubscription(req, res));
saasRoutes.post('/subscribe', authMiddleware, (req, res) => saasController.subscribe(req, res));
saasRoutes.post('/cancel', authMiddleware, (req, res) => saasController.cancelSubscription(req, res));
saasRoutes.get('/payments', authMiddleware, (req, res) => saasController.payments(req, res));
saasRoutes.post('/webhook', (req, res) => saasController.webhook(req, res));

export { saasRoutes };
