import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRouter = Router();
const userController = new UserController();

// Todas as rotas requerem autenticação
userRouter.use(authMiddleware);

userRouter.get('/', userController.list);
userRouter.get('/:id', userController.show);
userRouter.post('/', userController.create);
userRouter.put('/:id', userController.update);
userRouter.delete('/:id', userController.delete);

export { userRouter };
