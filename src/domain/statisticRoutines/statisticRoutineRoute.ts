import { Router } from 'express';
import { StaticRoutineController } from './statisticRoutineController';

const router = Router();
const staticRoutineController = new StaticRoutineController();

router.get('/api/week/:user_id', (req, res) =>
  staticRoutineController.getWeeklyStats(req, res)
);

router.get('/api/month/:user_id', (req, res) =>
  staticRoutineController.getMonthlyStats(req, res)
);

export default router;
