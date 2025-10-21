import { Request, Response } from 'express';
import { UserRepository } from '../users/userRepository';
import {
  NotFoundDataError,
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

  // 사용자 루틴 생성
  public async createUserRoutines(req: Request, res: Response) {
    try {
      const { user_id, routine_id } = req.body;

      if (!user_id || !routine_id) {
        const err = new PropertyRequiredError(
          'user_id와 routine_id의 값이 없습니다.'
        );
        return reportErrorMessage(err, res);
      }

      const userRoutine = await this.userRoutineRepository.createUserRoutines({
        user_id,
        routine_id,
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

  // 사용자 저장 루틴 불러오기
  public async getUserRoutines(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      if (!user_id) {
        const err = new PropertyRequiredError('user_id가 필요합니다.');
        return reportErrorMessage(err, res);
      }

      const routines = await this.userRoutineRepository.findUserRoutines(
        Number(user_id)
      );

      if (!routines || routines.length === 0) {
        const err = new NotFoundDataError('등록된 루틴이 없습니다.');
        return reportErrorMessage(err, res);
      }

      return res
        .status(200)
        .json({ message: '사용자 루틴 목록 조회 성공', data: routines });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: '루틴 조회 실패' });
    }
  }

  public async deleteRoutines(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const { routine_id } = req.body;

      if (!user_id || !routine_id) {
        throw new PropertyRequiredError(
          'user_id 또는 routine_id가 필요합니다.'
        );
      }

      const deleteRoutines =
        await this.userRoutineRepository.deleteUserRoutines(
          Number(user_id),
          Number(routine_id)
        );

      if (!deleteRoutines) {
        throw new NotFoundDataError('삭제할 루틴을 찾을 수 없습니다.');
      }

      return res
        .status(200)
        .json({ message: '루틴이 성공적으로 삭제되었습니다.' });
    } catch (error) {
      console.error(error);
      return reportErrorMessage(error, res);
    }
  }
}
