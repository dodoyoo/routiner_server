import { Router } from 'express';
import { UserRoutineController } from './userRoutineController';
import { authMiddleware } from '../../utils/jwtAuth';

const router = Router();
const userRoutineController = new UserRoutineController();

router.post('/api/user-routines', authMiddleware, (req, res) =>
  userRoutineController.createUserRoutines(req, res)
);

router.get('/api/user-routines/:user_id', authMiddleware, (req, res) =>
  userRoutineController.getUserRoutines(req, res)
);

router.delete('/api/user-routines/:user_id', authMiddleware, (req, res) =>
  userRoutineController.deleteRoutines(req, res)
);

export default router;
