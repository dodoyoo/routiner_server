import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { RoutineTimes } from '../routineTimes/routineTimeEntity';

export class StaticRoutineRepository {
  private repository: Repository<RoutineTimes>;

  constructor(dataSource = AppDataSource) {
    this.repository = dataSource.getRepository(RoutineTimes);
  }

  private toDateStringKST(date: Date) {
    const korea = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return korea.toISOString().split('T')[0];
  }

  private async statsByPeriod(user_id: number, startOffsetDays: number) {
    try {
      const today = new Date();
      const endStr = this.toDateStringKST(today);
      const start = new Date(
        today.getTime() - startOffsetDays * 24 * 60 * 60 * 1000
      );
      const startStr = this.toDateStringKST(start);

      // 1) 먼저 유저가 가진 루틴의 카테고리 목록(기간과 무관하게 유저 루틴 기반)
      //    -> user_routines 에 속한 루틴의 category(또는 categories 테이블)를 기준으로 목록 확보
      //    (이렇게 하면 해당 카테고리에 기록이 없어도 결과에 0으로 포함 가능)
      const categoriesQuery = this.repository.manager
        .createQueryBuilder()
        .select('c.id', 'category_id')
        .addSelect('c.name', 'category_name')
        .from('user_routines', 'ur')
        .innerJoin('routines', 'r', 'r.id = ur.routine_id')
        .innerJoin('categories', 'c', 'c.id = r.category_id')
        .where('ur.user_id = :user_id', { user_id })
        .groupBy('c.id');

      const categories = await categoriesQuery.getRawMany();

      // 2) 기간 내 category별 성공/전체 집계 (routine_times 기반)
      const aggQuery = this.repository
        .createQueryBuilder('rt')
        .select('r.category_id', 'category_id')
        .addSelect(
          'SUM(CASE WHEN rt.progress = 100 THEN 1 ELSE 0 END)',
          'success_count'
        )
        .addSelect('COUNT(rt.id)', 'total_count')
        .innerJoin('user_routines', 'ur', 'ur.id = rt.user_routine_id')
        .innerJoin('routines', 'r', 'r.id = ur.routine_id')
        .where('rt.user_id = :user_id', { user_id })
        .andWhere('rt.date BETWEEN :start AND :end', {
          start: startStr,
          end: endStr,
        })
        .groupBy('r.category_id');

      const agg = await aggQuery.getRawMany();

      // 3) 합치기: categories (left) + agg (right)
      const aggMap = new Map<
        number,
        { success_count: number; total_count: number }
      >();
      for (const row of agg) {
        const cid = Number(row.category_id);
        aggMap.set(cid, {
          success_count: Number(row.success_count),
          total_count: Number(row.total_count),
        });
      }

      const result = categories.map((c: any) => {
        const cid = Number(c.category_id);
        const name = c.category_name;
        const stats = aggMap.get(cid) ?? { success_count: 0, total_count: 0 };
        const success_rate =
          stats.total_count === 0
            ? 0
            : Number(
                ((stats.success_count * 100) / stats.total_count).toFixed(1)
              );
        return { category_id: cid, category: name, success_rate };
      });

      return result;
    } catch (error) {
      console.error('statsByPeriod error:', error);
      throw new Error('통계 조회 중 오류가 발생했습니다.');
    }
  }

  // public API: 주간 (최근 7일: startOffsetDays = 6)
  public async getWeeklyStats(user_id: number) {
    return await this.statsByPeriod(user_id, 6);
  }
}

//   public async staticRoutineWeeks(user_id: number) {
//     try {
//       const weeks = this.repository
//         .createQueryBuilder('rt')
//         .select('r.category', 'category')
//         .addSelect(
//           'ROUND(SUM(CASE WHEN rt.progress = 100 THEN 1 ELSE 0 END) * 100.0 / COUNT(rt.id), 1)',
//           'success_rate'
//         )
//         .innerJoin('rt.userRoutine', 'ur')
//         .innerJoin('ur.routine', 'r')
//         .where('rt.user_id = :user_id', { user_id })
//         .andWhere(
//           'rt.date BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()'
//         )
//         .groupBy('r.category');

//       const result = await weeks.getRawMany();
//       return result;
//     } catch (error) {
//       console.error('주간 통계 조회 실패:', error);
//       throw new Error('Failed to get weekly statics');
//     }
//   }
// }
