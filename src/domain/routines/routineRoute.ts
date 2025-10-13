import { Router } from 'express';
import { RoutineController } from './routineController';

const router = Router();
const routineController = new RoutineController();

router.get('/api/routines', (req, res) =>
  routineController.allRoutines(req, res)
);

export default router;
