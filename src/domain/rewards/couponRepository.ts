import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { Coupons } from './couponEntity';
import { UserRoutines } from '../userRoutines/userRoutineEntity';
import { RoutineTimes } from '../routineTimes/routineTimeEntity';

export class CouponRepository {
  private couponRepository: Repository<Coupons>;
  private userRoutineRepository: Repository<UserRoutines>;
  private routineTimeRepository: Repository<RoutineTimes>;

  constructor(dataSource = AppDataSource) {
    this.couponRepository = dataSource.getRepository(Coupons);
    this.userRoutineRepository = dataSource.getRepository(UserRoutines);
    this.routineTimeRepository = dataSource.getRepository(RoutineTimes);
  }

  private getMonthRangeKST(date = new Date()) {
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const year = kst.getFullYear();
    const month = kst.getMonth();

    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 0));

    const toYmd = (d: Date) => d.toISOString().split('T')[0];

    return {
      startStr: toYmd(start),
      endStr: toYmd(end),
      year,
      month: month + 1,
    };
  }

  //이번 달 "완주된 7일 루틴" 개수
  public async countMonthlyCompletions(
    user_id: number,
    monthDate = new Date()
  ) {
    const { startStr, endStr } = this.getMonthRangeKST(monthDate);

    const row = await this.userRoutineRepository
      .createQueryBuilder('ur')
      .select('COUNT(*)', 'cnt')
      .where('ur.user_id = :user_id', { user_id })
      // "이번 달 완주" 기준: end_date가 이번 달에 속한 7일 루틴
      .andWhere('ur.end_date BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      // 7일 루틴만
      .andWhere('DATEDIFF(ur.end_date, ur.start_date) = 6')
      // 완주 조건: routine_times 성공 날짜 7개
      .andWhere((qb) => {
        const sub = qb
          .subQuery()
          .select('COUNT(DISTINCT DATE(rt.date))')
          .from(RoutineTimes, 'rt')
          .where('rt.user_routine_id = ur.id')
          .andWhere('rt.user_id = :user_id')
          .andWhere('rt.progress = 100')
          .andWhere('DATE(rt.date) BETWEEN ur.start_date AND ur.end_date')
          .getQuery();
        return `${sub} >= 7`;
      })
      .setParameter('user_id', user_id)
      .getRawOne<{ cnt: string }>();

    return Number(row?.cnt || 0);
  }

  // 이번 달 "이미 발급된 쿠폰 수"
  public async countIssuedCouponsForMonth(
    user_id: number,
    monthDate = new Date()
  ) {
    const { startStr, endStr } = this.getMonthRangeKST(monthDate);

    const row = await this.couponRepository
      .createQueryBuilder('c')
      .select('COUNT(*)', 'cnt')
      .where('c.user_id = :user_id', { user_id })
      .andWhere('c.period_start = :start', { start: startStr })
      .andWhere('c.period_end = :end', { end: endStr })
      .getRawOne<{ cnt: string }>();

    return Number(row?.cnt || 0);
  }

  // 이번 달 정산: (완주횟수/20) - 이미발급 = 추가 발급 가능 수
  // requestCount를 받아서 "원하는 만큼만" 발급도 가능하게 설계
  public async issueMonthlyCouponsByProgress(
    user_id: number,
    trigger_user_routine_id: number,
    requestCount?: number // optional: 사용자가 n장만 발급 요청
  ) {
    const requiredPerCoupon = 1;
    const { startStr, endStr, year, month } = this.getMonthRangeKST(new Date());

    const completionCount = await this.countMonthlyCompletions(user_id);
    const maxCouponsByRule = Math.floor(completionCount / requiredPerCoupon);

    const alreadyIssued = await this.countIssuedCouponsForMonth(user_id);

    const canIssue = maxCouponsByRule - alreadyIssued;

    if (canIssue <= 0) {
      return {
        issued: false,
        reason: '발급 가능 쿠폰 없음',
        year,
        month,
        periodStart: startStr,
        periodEnd: endStr,
        completionCount,
        requiredPerCoupon,
        maxCouponsByRule,
        alreadyIssued,
        canIssue: 0,
      };
    }

    const toIssue = requestCount ? Math.min(requestCount, canIssue) : canIssue;

    const coupons = Array.from({ length: toIssue }).map(() =>
      this.couponRepository.create({
        user_id,
        user_routine_id: trigger_user_routine_id, // 기록용
        period_start: startStr,
        period_end: endStr,
        status: 'issued',
      })
    );

    const saved = await this.couponRepository.save(coupons);

    return {
      issued: true,
      year,
      month,
      periodStart: startStr,
      periodEnd: endStr,
      completionCount,
      requiredPerCoupon,
      maxCouponsByRule,
      alreadyIssued,
      issuedNow: toIssue,
      coupons: saved,
    };
  }

  // 쿠폰 목록
  public async couponList(
    user_id: number,
    status?: 'issued' | 'redeemed' | 'expired'
  ) {
    try {
      const coupons = this.couponRepository
        .createQueryBuilder('coupon')
        .where('coupon.user_id = :user_id', { user_id })
        .orderBy('coupon.issued_at', 'DESC');

      if (status) coupons.andWhere('coupon.status = :status', { status });
      return await coupons.getMany();
    } catch (err) {
      console.error('couponList error:', err);
      throw new Error('쿠폰 목록 조회 오류');
    }
  }

  // 사용 가능 쿠폰 개수
  public async availableCoupon(user_id: number) {
    try {
      const available = await this.couponRepository
        .createQueryBuilder('count')
        .select('COUNT(*)', 'cnt')
        .where('count.user_id = :user_id', { user_id })
        .andWhere('count.status = "issued"')
        .getRawOne<{ cnt: string }>();

      return Number(available?.cnt || 0);
    } catch (err) {
      console.error('error:', err);
      throw new Error('쿠폰 개수 조회 오류');
    }
  }
}
