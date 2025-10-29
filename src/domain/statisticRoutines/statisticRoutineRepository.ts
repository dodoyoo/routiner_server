import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { RoutineTimes } from '../routineTimes/routineTimeEntity';
import { UserRoutines } from '../userRoutines/userRoutineEntity';
import { Routines } from '../routines/routineEntity';
import { Categories } from '../routines/categoryEntity';

export class StaticRoutineRepository {
  private userRepository: Repository<UserRoutines>;
  private routineTimeRepository: Repository<RoutineTimes>;

  constructor(dataSource = AppDataSource) {
    this.userRepository = dataSource.getRepository(UserRoutines);
    this.routineTimeRepository = dataSource.getRepository(RoutineTimes);
  }

  // KST 'YYYY-MM-DD'로 변환
  private toDateStringKST(date: Date) {
    const korea = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return korea.toISOString().split('T')[0];
  }

  // KST 기준 최근 N일 범위
  private todayStrKST() {
    const now = new Date();
    const endStr = this.toDateStringKST(now);
    return endStr;
  }

  // 날짜 문자열 두 개로 일수 차이 계산
  private daysInclusive(fromStr: string, toStr: string) {
    const from = new Date(fromStr);
    const to = new Date(toStr);
    const diff = (to.getTime() - from.getTime()) / 86400000;
    return diff + 1;
  }

  // 두 구간 [A1,A2], [B1,B2]의 겹치는 부분을 'YYYY-MM-DD'로 반환 (없으면 undefined)
  private intersectRange(
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string
  ) {
    const start = aStart > bStart ? aStart : bStart;
    const end = aEnd < bEnd ? aEnd : bEnd;
    if (start > end) return undefined;
    return { start, end };
  }

  // 지정 기간 통계 계산
  private async computeStats(
    user_id: number,
    periodStart: string,
    periodEnd: string
  ) {
    // 이번 기간과 겹치는 유저 루틴 + 카테고리
    const userRows = await this.userRepository
      .createQueryBuilder('ur')
      .select('ur.id', 'ur_id')
      .addSelect('r.category_id', 'category_id')
      .addSelect('c.name', 'category_name')
      .addSelect('ur.start_date', 'start_date')
      .addSelect('ur.end_date', 'end_date')
      .innerJoin(Routines, 'r', 'r.id = ur.routine_id')
      .innerJoin(Categories, 'c', 'c.id = r.category_id')
      .where('ur.user_id = :user_id', { user_id })
      .andWhere('ur.start_date <= :periodEnd', { periodEnd })
      .andWhere('ur.end_date >= :periodStart', { periodStart })
      .getRawMany<{
        ur_id: number;
        category_id: number;
        category_name: string;
        start_date: string;
        end_date: string;
      }>();

    if (!userRows.length) {
      return {
        total_routines: 0,
        period: { start: periodStart, end: periodEnd },
        categories: [] as Array<{
          id: number;
          name: string;
          success_rate: number;
        }>,
      };
    }

    // 2) 기간 내 성공(100) 건수 - user_routine_id별
    const successRows = await this.routineTimeRepository
      .createQueryBuilder('rt')
      .select('rt.user_routine_id', 'ur_id')
      .addSelect('COUNT(*)', 'success_count')
      .innerJoin(UserRoutines, 'ur', 'ur.id = rt.user_routine_id')
      .where('rt.user_id = :user_id', { user_id })
      .andWhere('rt.progress = 100')
      .andWhere('rt.date BETWEEN :start AND :end', {
        start: periodStart,
        end: periodEnd,
      })
      .groupBy('rt.user_routine_id')
      .getRawMany<{ ur_id: number; success_count: string }>();

    const successMap = new Map<number, number>();
    for (const row of successRows) {
      successMap.set(Number(row.ur_id), Number(row.success_count));
    }

    // 3) 루틴별 성공률 -> 카테고리 평균
    type Bucket = { name: string; rates: number[] };
    const catMap = new Map<number, Bucket>();
    let contributing = 0;

    for (const ur of userRows) {
      const overlap = this.intersectRange(
        ur.start_date,
        ur.end_date,
        periodStart,
        periodEnd
      );
      if (!overlap) continue;

      const denomDays = this.daysInclusive(overlap.start, overlap.end);
      if (denomDays <= 0) continue;

      contributing++;
      const successDays = successMap.get(Number(ur.ur_id)) ?? 0;
      const rate = (successDays * 100) / denomDays;

      const cid = Number(ur.category_id);
      const name = ur.category_name;
      if (!catMap.has(cid)) catMap.set(cid, { name, rates: [] });
      catMap.get(cid)!.rates.push(rate);
    }

    const categories = Array.from(catMap.entries()).map(([id, bucket]) => {
      const avg =
        bucket.rates.length === 0
          ? 0
          : Number(
              (
                bucket.rates.reduce((a, b) => a + b, 0) / bucket.rates.length
              ).toFixed(1)
            );
      return { id, name: bucket.name, success_rate: avg };
    });

    categories.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    return {
      total_routines: contributing,
      period: { start: periodStart, end: periodEnd },
      categories,
    };
  }
  public async getWeeklyStats(user_id: number) {
    try {
      const end = this.todayStrKST() as string;
      const startDate = new Date(end);
      startDate.setDate(startDate.getDate() - 6);
      const start = this.toDateStringKST(startDate) as string;
      return await this.computeStats(user_id, start, end);
    } catch (err) {
      console.error('WeeklyStats Error:', err);
      throw new Error('주간 통계 조회 중 오류가 발생하였습니다.');
    }
  }
}
