import { Router } from 'express';
import { RoutineController } from './routineController';
import { authMiddleware } from '../../utils/jwtAuth';

const router = Router();
const routineController = new RoutineController();

router.get('/api/routines', authMiddleware, (req, res) =>
  routineController.allRoutines(req, res)
);

router.get('/api/routines/:category', authMiddleware, (req, res) =>
  routineController.routinesByCategory(req, res)
);

export default router;
