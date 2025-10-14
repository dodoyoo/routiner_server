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
      console.error(error);

      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: '루틴 선택에 실패했습니다.' });
    }
  }
}
