import { Router } from 'express';
import { PlanController } from '../controllers/PlanController';
import { authMiddleware } from '../middlewares/authMiddleware';

const planRouter = Router();
const planController = new PlanController();

// Todas as rotas requerem autenticação
planRouter.use(authMiddleware);

planRouter.get('/', planController.list);
planRouter.get('/:id', planController.show);
planRouter.post('/', planController.create);
planRouter.put('/:id', planController.update);
planRouter.delete('/:id', planController.delete);

export { planRouter };
