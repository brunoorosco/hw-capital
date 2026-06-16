import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middlewares/authMiddleware';

const reportRoutes = Router();
const reportController = new ReportController();

reportRoutes.use(authMiddleware);

reportRoutes.get('/cashflow', (req, res) => reportController.cashFlowReport(req, res));

export { reportRoutes };
