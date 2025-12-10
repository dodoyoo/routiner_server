import { Router } from 'express';
import { RoutineTimeController } from './routineTimeController';
import { authMiddleware } from '../../utils/jwtAuth';

const router = Router();
const routineTimeController = new RoutineTimeController();

// 금일 루틴 조회
router.get('/api/routine-time/today', authMiddleware, (req, res) =>
  routineTimeController.getTodayRoutine(req, res)
);

// 루틴 완료
router.post('/api/routine-time/complete', authMiddleware, (req, res) =>
  routineTimeController.completeRoutine(req, res)
);

export default router;
