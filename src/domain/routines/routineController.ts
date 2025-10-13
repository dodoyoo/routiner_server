import { Response, Request } from 'express';
import {
  InvalidPropertyError,
  PropertyRequiredError,
} from '../../utils/customError';
import { RoutineRepository } from './routineRepository';
import { reportErrorMessage } from '../../utils/errorHandling';

export class RoutineController {
  private routineRepository: RoutineRepository;

  constructor() {
    this.routineRepository = new RoutineRepository();
  }

  public async allRoutines(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const routines = await this.routineRepository.findAllRoutines(
        page,
        pageSize
      );

      if (!routines || routines.length === 0) {
        return res.status(404).json({
          message: '루틴이 존재하지 않습니다.',
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: '루틴 목록 불러오기 성공',
        data: routines,
      });
    } catch (error: unknown) {
      console.error('루틴 목록 조회 실패', error);
      return reportErrorMessage(error, res);
    }
  }
}
