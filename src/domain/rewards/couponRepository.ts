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

  private toDateStringKST(date: Date) {
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
  }

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
          id: number;
          user_id: number;
          start_date: string;
          end_date: string;
        }>();

      if (!userRoutine) {
        throw new Error('존재하지 않는 사용자 루틴입니다.');
      }

      const start = new Date(userRoutine.start_date);
      const end = new Date(userRoutine.end_date);
      const requiredDays = Math.floor(
        end.getTime() - start.getTime() / 8640000 + 1
      );

      if (requiredDays !== 7) {
      }

      const successRow = await this.routineTimeRepository
        .createQueryBuilder('routine_time')
        .select('COUNT(DISTINCT routine_time.date)', 'success_days')
        .where('routine_time.user_id', { user_id })
        .andWhere('routine_time.user_routine_id', { user_routine_id })
        .andWhere('routine_time.progress = 100')
        .andWhere('routine_time.date BETWEEN :start AND :end', {
          start: userRoutine.start_date,
          end: userRoutine.end_date,
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
          period_start: userRoutine.start_date,
          period_end: userRoutine.end_date,
        },
      });

      if (existCoupon) {
        return { issued: false, reason: '이미 발급됨', coupon: existCoupon };
      }

      const coupon = this.couponRepository.create({
        user_id,
        user_routine_id,
        period_start: userRoutine.start_date,
        period_end: userRoutine.end_date,
        status: 'issued',
      });

      const saved = await this.couponRepository.save(coupon);
      return { issued: true, coupon: saved };
    } catch (error) {
      console.error('issueCoupon:', error);
      throw new Error('쿠폰 발급 중 오류가 발생하였습니다.');
    }
  }
}
