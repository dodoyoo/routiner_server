import { Request, Response } from 'express';
import { UserRepository } from '../users/userRepository';
import {
  PropertyRequiredError,
  ValidationError,
} from '../../utils/customError';
import { reportErrorMessage } from '../../utils/errorHandling';
import { UserRoutineRepository } from './userRoutineRepository';

export class UserRoutineController {
  private userRoutineRepository: UserRoutineRepository;

  constructor() {
    this.userRoutineRepository = new UserRoutineRepository();
  }

  public async createUserRoutines(req: Request, res: Response) {
    try {
      const { user_id, routine_id, start_date, end_date } = req.body;

      if (!user_id) {
        const err = new ValidationError(
          '사용자를 찾을 수 없습니다.',
          'NOT FOUND',
          404
        );
        return reportErrorMessage(err, res);
      }

      if (!user_id || !routine_id) {
        const err = new PropertyRequiredError(
          'user_id와 routine_id의 값이 없습니다.'
        );
        return reportErrorMessage(err, res);
      }

      const userRoutine = await this.userRoutineRepository.createUserRoutine({
        user_id,
        routine_id,
        start_date,
        end_date,
      });
      return res.status(201).json({
        message: '루틴이 성공적으로 선택되었습니다.',
        data: userRoutine,
      });
    } catch (error: any) {
      console.error('루틴 선택 중 오류:', error);

      if (error.message === '이미 선택한 루틴입니다.') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: '루틴 선택에 실패했습니다.' });
    }
  }
}
