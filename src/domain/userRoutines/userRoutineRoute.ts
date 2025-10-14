import { Router } from 'express';
import { UserRoutineController } from './userRoutineController';

const router = Router();
const userRoutineController = new UserRoutineController();

router.post('/api/user-routines', (req, res) =>
  userRoutineController.createUserRoutines(req, res)
);

router.get('/api/user-routines/:user_id', (req, res) =>
  userRoutineController.getUserRoutines(req, res)
);

export default router;
