import { Router } from 'express';
import { ReconciliationController } from '../controllers/ReconciliationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const reconciliationRoutes = Router();
const reconciliationController = new ReconciliationController();

reconciliationRoutes.use(authMiddleware);

reconciliationRoutes.get('/', (req, res) => reconciliationController.list(req, res));
reconciliationRoutes.get('/:id', (req, res) => reconciliationController.show(req, res));
reconciliationRoutes.post('/', (req, res) => reconciliationController.create(req, res));
reconciliationRoutes.put('/:id', (req, res) => reconciliationController.update(req, res));
reconciliationRoutes.delete('/:id', (req, res) => reconciliationController.delete(req, res));

export { reconciliationRoutes };
