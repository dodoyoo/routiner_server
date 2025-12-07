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

  // 쿠폰 발급
  public async issueCoupon(user_id: number, user_routine_id: number) {
    try {
      const userRoutine = await this.userRoutineRepository
        .createQueryBuilder('user_routine')
        .select([
          'user_routine.id',
          'user_routine.user_id',
          'user_routine.start_date',
          'user_routine.end_date',
        ])
        .where('user_routine.id = :user_routine_id', { user_routine_id })
        .andWhere('user_routine.user_id = :user_id', { user_id })
        .getRawOne<{
          user_routine_id: number;
          user_routine_user_id: number;
          user_routine_start_date: string;
          user_routine_end_date: string;
        }>();

      if (!userRoutine) {
        throw new Error('존재하지 않는 사용자 루틴입니다.');
      }

      const start = new Date(userRoutine.user_routine_start_date);
      const end = new Date(userRoutine.user_routine_end_date);

      const requiredDays = 7;

      if (requiredDays !== 7) {
        return {
          issued: false,
          reason: 'PERIOD_NOT_7_DAYS',
          requiredDays,
          successDays: 0,
        };
      }

      const successRow = await this.routineTimeRepository
        .createQueryBuilder('routine_time')
        .select('COUNT(DISTINCT routine_time.date)', 'success_days')
        .where('routine_time.user_id', { user_id })
        .andWhere('routine_time.user_routine_id', { user_routine_id })
        .andWhere('routine_time.progress = 100')
        .andWhere('routine_time.date BETWEEN :start AND :end', {
          start: userRoutine.user_routine_start_date,
          end: userRoutine.user_routine_end_date,
        })
        .getRawOne<{ success_days: string }>();

      const successDays = Number(successRow?.success_days || 0);

      if (successDays < requiredDays) {
        return { issued: false, reason: '미달성', requiredDays, successDays };
      }

      const existCoupon = await this.couponRepository.findOne({
        where: {
          user_id,
          user_routine_id,
          period_start: userRoutine.user_routine_start_date,
          period_end: userRoutine.user_routine_end_date,
        },
      });

      if (existCoupon) {
        return {
          issued: false,
          reason: '이미 발급됨',
          requiredDays,
          successDays,
          coupon: existCoupon,
        };
      }

      const coupon = this.couponRepository.create({
        user_id,
        user_routine_id,
        period_start: userRoutine.user_routine_start_date,
        period_end: userRoutine.user_routine_end_date,
        status: 'issued',
      });

      const saved = await this.couponRepository.save(coupon);
      return { issued: true, coupon: saved, requiredDays, successDays };
    } catch (error) {
      console.error('issueCoupon:', error);
      throw new Error('쿠폰 발급 중 오류가 발생하였습니다.');
    }
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
