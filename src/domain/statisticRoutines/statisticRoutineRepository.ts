import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { RoutineTimes } from '../routineTimes/routineTimeEntity';

export class StaticRoutineRepository {
  private repository: Repository<RoutineTimes>;

  constructor(dataSource = AppDataSource) {
    this.repository = dataSource.getRepository(RoutineTimes);
  }

  public async staticRoutineWeeks(user_id: number) {
    try {
      const weeks = this.repository
        .createQueryBuilder('rt')
        .select('r.category', 'category')
        .addSelect(
          'ROUND(SUM(CASE WHEN rt.progress = 100 THEN 1 ELSE 0 END) * 100.0 / COUNT(rt.id), 1)',
          'success_rate'
        )
        .innerJoin('rt.userRoutine', 'ur')
        .innerJoin('ur.routine', 'r')
        .where('rt.user_id = :user_id', { user_id })
        .andWhere(
          'rt.date BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()'
        )
        .groupBy('r.category');

      const result = await weeks.getRawMany();
      return result;
    } catch (error) {
      console.error('주간 통계 조회 실패:', error);
      throw new Error('Failed to get weekly statics');
    }
  }
}
