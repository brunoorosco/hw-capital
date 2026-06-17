import { Router } from 'express';
import { CnpjController } from '../controllers/CnpjController';
import { authMiddleware } from '../middlewares/authMiddleware';

const cnpjRoutes = Router();
const cnpjController = new CnpjController();

cnpjRoutes.use(authMiddleware);

cnpjRoutes.get('/:cnpj', (req, res) => cnpjController.lookup(req, res));

export { cnpjRoutes };
