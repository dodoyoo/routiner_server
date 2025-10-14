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

  //모든 루틴 목록 가져오기
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
        message: '루틴 목록 불러오기 성공',
        data: routines,
      });
    } catch (error: unknown) {
      console.error('루틴 목록 조회 실패', error);
      return reportErrorMessage(error, res);
    }
  }

  // 카테고리 별로 루틴 가져오기
  public async routinesByCategory(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const category = req.params.category;
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

      if (!category) {
        throw new PropertyRequiredError('카테고리가 필요합니다.');
      }

      const routines = await this.routineRepository.findRoutinesByCategory(
        category,
        page,
        pageSize
      );

      if (!routines || routines.length === 0) {
        return res.status(404).json({
          message: `${category} 카테고리에 해당하는 루틴이 없습니다.`,
          data: [],
        });
      }

      return res.status(200).json({
        message: `${category} 카테고리의 루틴을 성공적으로 불러왔습니다.`,
        data: routines,
      });
    } catch (error: any) {
      console.error('카테고리별 루틴 조회 중 오류:', error);

      if (error instanceof PropertyRequiredError) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({
        message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
  }
}
