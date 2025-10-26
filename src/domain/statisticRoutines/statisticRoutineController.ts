import { Response, Request } from 'express';
import { PropertyRequiredError } from '../../utils/customError';
import { StaticRoutineRepository } from './statisticRoutineRepository';
import { reportErrorMessage } from '../../utils/errorHandling';

export class StaticRoutineController {
  private staticRoutineRepository: StaticRoutineRepository;

  constructor() {
    this.staticRoutineRepository = new StaticRoutineRepository();
  }

  public async getWeeklyStats(req: Request, res: Response) {
    try {
      const user_id = Number(req.params.user_id);

      if (!user_id || isNaN(user_id)) {
        return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
      }

      const stats = await this.staticRoutineRepository.staticRoutineWeeks(
        user_id
      );

      if (!stats || stats.length === 0) {
        return res.status(404).json({
          message: '해당 사용자의 주간 루틴 데이터가 없습니다.',
          data: [],
        });
      }
      return res.status(200).json({
        message: '주간 루틴 통계 조회 성공',
        data: stats,
      });
    } catch (error: unknown) {
      console.error('주간 통계 에러:', error);
      return reportErrorMessage(error, res);
    }
  }
}
