import { Router } from 'express';
import { CashFlowController } from '../controllers/CashFlowController';
import { authMiddleware } from '../middlewares/authMiddleware';

const cashflowRoutes = Router();
const cashflowController = new CashFlowController();

cashflowRoutes.use(authMiddleware);

cashflowRoutes.get('/', (req, res) => cashflowController.list(req, res));
cashflowRoutes.get('/summary', (req, res) => cashflowController.summary(req, res));
cashflowRoutes.get('/:id', (req, res) => cashflowController.show(req, res));
cashflowRoutes.post('/', (req, res) => cashflowController.create(req, res));
cashflowRoutes.put('/:id', (req, res) => cashflowController.update(req, res));
cashflowRoutes.delete('/:id', (req, res) => cashflowController.delete(req, res));

export { cashflowRoutes };
