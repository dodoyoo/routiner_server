import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { UserRoutines } from './userRoutineEntity';
import { User } from '../users/userEntity';
import {
  NotFoundDataError,
  DuplicatePropertyError,
} from '../../utils/customError';

export class UserRoutineRepository {
  private repository: Repository<UserRoutines>;
  private userRepository: Repository<User>;

  constructor(dataSource = AppDataSource) {
    this.repository = dataSource.getRepository(UserRoutines);
    this.userRepository = dataSource.getRepository(User);
  }

  private toKstYmd(dateLike: any): string {
    const d = new Date(dateLike);
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0]!;
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private isCompletedOn(ur: any, ymd: string): boolean {
    const times = ur.routineTimes || [];
    return times.some((rt: any) => {
      if (!rt?.date) return false;
      const rtYmd = this.toKstYmd(rt.date);
      return rtYmd === ymd && (rt.progress ?? 0) >= 100;
    });
  }

  // 사용자 루틴 생성
  public async createUserRoutines(data: {
    user_id: number;
    routine_id: number;
  }) {
    const { user_id, routine_id } = data;

    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundDataError('존재하지 않는 사용자입니다.');
    }

    const existingActive = await this.repository.findOne({
      where: { user_id, routine_id, is_active: true },
    });

    if (existingActive) {
      throw new DuplicatePropertyError('이미 선택한 루틴입니다.');
    }

    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const startStr = kst.toISOString().split('T')[0]!;

    const startDate = new Date(startStr);
    const endDate = new Date(startStr);
    endDate.setDate(endDate.getDate() + 6);

    const newRoutines = this.repository.create({
      user_id,
      routine_id,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
    });

    return await this.repository.save(newRoutines);
  }

  // 사용자 루틴 조회
  public async findUserRoutines(user_id: number) {
    try {
      const todayYmd = this.toKstYmd(new Date());

      const routines = await this.repository
        .createQueryBuilder('user_routine')
        .leftJoinAndSelect('user_routine.routine', 'routine')
        .leftJoinAndSelect('routine.category', 'category')
        .leftJoinAndSelect(
          'user_routine.routineTimes',
          'routineTime',
          'routineTime.user_id = :user_id',
          { user_id }
        )
        .where('user_routine.user_id = :user_id', { user_id })
        .andWhere('user_routine.is_active = :active', { active: true })
        .orderBy('user_routine.start_date', 'DESC')
        .getMany();

      const toDeactivate: UserRoutines[] = [];

      for (const ur of routines) {
        if (!ur.start_date) continue;

        // 7일 중 "오늘 이전 날짜"에 미완료가 있으면 실패로 간주
        let missed = false;

        for (let i = 0; i < 7; i++) {
          const dayYmd = this.toKstYmd(
            this.addDays(new Date(ur.start_date as any), i)
          );

          // 오늘 이전만 체크 (오늘은 아직 완료 안 했을 수 있으니 제외)
          if (dayYmd < todayYmd) {
            const done = this.isCompletedOn(ur, dayYmd);
            if (!done) {
              missed = true;
              break;
            }
          }
        }

        if (missed) {
          ur.is_active = false;
          toDeactivate.push(ur);
        }
      }

      if (toDeactivate.length > 0) {
        await this.repository.save(toDeactivate);
      }
      return routines.filter((ur) => ur.is_active);
    } catch (error) {
      console.error('루틴을 불러오는데 실패했습니다.', error);
      throw new Error('Failed to get routines');
    }
  }

  // 루틴 삭제
  public async deleteUserRoutines(
    user_id: number,
    routine_id: number
  ): Promise<boolean> {
    const userRoutines = await this.repository.findOne({
      where: { user_id, routine_id },
    });

    if (!userRoutines) {
      return false;
    }
    await this.repository.remove(userRoutines);
    return true;
  }

  public async findCurrentUserRoutines(user_id: number) {
    const todayYmd = this.toKstYmd(new Date());

    const routines = await this.repository
      .createQueryBuilder('user_routine')
      .leftJoinAndSelect('user_routine.routine', 'routine')
      .leftJoinAndSelect('routine.category', 'category')
      .leftJoinAndSelect(
        'user_routine.routineTimes',
        'routineTime',
        'routineTime.user_id = :user_id',
        { user_id }
      )
      .where('user_routine.user_id = :user_id', { user_id })
      .andWhere('user_routine.is_active = :active', { active: true })
      .andWhere('DATE(user_routine.start_date) <= :today', { today: todayYmd })
      .andWhere('DATE(user_routine.end_date) >= :today', { today: todayYmd })
      .orderBy('user_routine.start_date', 'DESC')
      .getMany();

    const toDeactivate: UserRoutines[] = [];

    for (const ur of routines) {
      if (!ur.start_date) continue;

      let missed = false;
      for (let i = 0; i < 7; i++) {
        const dayYmd = this.toKstYmd(
          this.addDays(new Date(ur.start_date as any), i)
        );
        if (dayYmd < todayYmd) {
          if (!this.isCompletedOn(ur, dayYmd)) {
            missed = true;
            break;
          }
        }
      }

      if (missed) {
        ur.is_active = false;
        toDeactivate.push(ur);
      }
    }

    if (toDeactivate.length > 0) {
      await this.repository.save(toDeactivate);
    }

    return routines.filter((ur) => ur.is_active);
  }
}
