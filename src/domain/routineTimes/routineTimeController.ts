import { Request, Response } from 'express';
import { RoutineTimeRepository } from './routineTimeRepository';
import {
  InvalidPropertyError,
  PropertyRequiredError,
} from '../../utils/customError';

export class RoutineTimeController {
  private routineTimeRepository: RoutineTimeRepository;

  constructor() {
    this.routineTimeRepository = new RoutineTimeRepository();
  }

  public async completeRoutine(req: Request, res: Response) {
    try {
      const { user_id, user_routine_id } = req.body;

      if (!user_id || !user_routine_id) {
        return res
          .status(400)
          .json({ message: 'user_id와 user_routine_id가 필요합니다.' });
      }

      const result = await this.routineTimeRepository.routineComplete(
        user_id,
        user_routine_id
      );
      return res.status(200).json({ message: '루틴 완료 처리 성공', result });
    } catch (error) {
      console.error('루틴 완료 처리 실패:', error);
      return res.status(500).json({ message: '서버 에러' });
    }
  }

  // ✅ 금일 루틴 상태 조회
  public async getTodayRoutine(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      if (!user_id) {
        return res.status(400).json({ message: 'user_id가 필요합니다.' });
      }

      const result = await this.routineTimeRepository.getTodayRoutineStatus(
        Number(user_id)
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error('금일 루틴 조회 실패:', error);
      return res.status(500).json({ message: '서버 에러' });
    }
  }
}
