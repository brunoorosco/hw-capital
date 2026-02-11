import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import { authMiddleware } from '../middlewares/authMiddleware';

const clientRoutes = Router();
const clientController = new ClientController();

// Todas as rotas de cliente requerem autenticação
clientRoutes.use(authMiddleware);

clientRoutes.get('/', (req, res) => clientController.list(req, res));
clientRoutes.get('/:id', (req, res) => clientController.show(req, res));
clientRoutes.post('/', (req, res) => clientController.create(req, res));
clientRoutes.put('/:id', (req, res) => clientController.update(req, res));
clientRoutes.delete('/:id', (req, res) => clientController.delete(req, res));
clientRoutes.patch('/:id/deactivate', (req, res) => clientController.deactivate(req, res));

export { clientRoutes };
