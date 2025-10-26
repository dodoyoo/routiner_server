import { Router } from 'express';
import { StaticRoutineController } from './statisticRoutineController';

const router = Router();
const staticRoutineController = new StaticRoutineController();

router.get('/api/:user_id/week', (req, res) =>
  staticRoutineController.getWeeklyStats(req, res)
);

export default router;
