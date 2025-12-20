import { Repository, Raw } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { UserRoutines } from '../userRoutines/userRoutineEntity';
import { RoutineTimes } from './routineTimeEntity';

export class RoutineTimeRepository {
  private repository: Repository<RoutineTimes>;

  constructor(dataSource = AppDataSource) {
    this.repository = dataSource.getRepository(RoutineTimes);
  }
  // 루틴 완료 (progress: 100)
  public async routineComplete(
    user_id: number,
    user_routine_id: number
  ): Promise<RoutineTimes> {
    const today = new Date().toISOString().split('T')[0] as string;
    const todayDate = new Date(today);

    const existing = await this.repository.findOne({
      where: { user_id, user_routine_id, date: todayDate },
    });

    if (existing) {
      existing.progress = 100;
      existing.updated_at = new Date();
      return await this.repository.save(existing);
    }

    const newRecord = this.repository.create({
      user_id,
      user_routine_id,
      date: todayDate,
      progress: 100,
    });

    return await this.repository.save(newRecord);
  }

  public async completeAndDeactivateIfFinished(
    user_id: number,
    user_routine_id: number
  ): Promise<{ record: RoutineTimes; deactivated: boolean }> {
    const record = await this.routineComplete(user_id, user_routine_id);

    const userRoutineRepo = AppDataSource.getRepository(UserRoutines);
    const routineTimeRepo = AppDataSource.getRepository(RoutineTimes);

    const ur = await userRoutineRepo.findOne({
      where: { id: user_routine_id, user_id },
    });

    if (!ur?.start_date || !ur?.end_date) {
      return { record, deactivated: false };
    }

    const startStr = ur.start_date.toISOString().slice(0, 10);
    const endStr = ur.end_date.toISOString().slice(0, 10);

    const row = await routineTimeRepo
      .createQueryBuilder('rt')
      .select('COUNT(DISTINCT DATE(rt.date))', 'cnt')
      .where('rt.user_id = :user_id', { user_id })
      .andWhere('rt.user_routine_id = :user_routine_id', { user_routine_id })
      .andWhere('rt.progress >= :p', { p: 100 })
      .andWhere('DATE(rt.date) BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      .getRawOne();

    const completedDays = Number(row?.cnt ?? 0);

    // 4) 7일 달성 시 비활성화
    if (completedDays >= 7) {
      await userRoutineRepo.update(
        { id: user_routine_id, user_id },
        { is_active: false }
      );
      return { record, deactivated: true };
    }
    return { record, deactivated: false };
  }

  // 자정 기준 자동 실패 처리 (progress: 0)
  public async routineFailed(
    user_id: number,
    user_routine_id: number
  ): Promise<RoutineTimes> {
    const today = new Date().toISOString().split('T')[0] as string;
    const todayDate = new Date(today);

    const exist = await this.repository.findOne({
      where: { user_id, user_routine_id, date: todayDate },
    });

    if (!exist) {
      const failedRecord = this.repository.create({
        user_id,
        user_routine_id,
        date: todayDate,
        progress: 0,
      });
      return await this.repository.save(failedRecord);
    }

    return exist;
  }

  // 금일 루틴 상태 조회
  public async getTodayRoutineStatus(user_id: number) {
    const now = new Date();
    const todayStr = new Date(now.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]; // "YYYY-MM-DD"

    return await this.repository
      .createQueryBuilder('routine_time')
      .leftJoinAndSelect('routine_time.userRoutine', 'userRoutine')
      .leftJoinAndSelect('userRoutine.routine', 'routine')
      .where('routine_time.user_id = :user_id', { user_id })
      .andWhere('routine_time.date = :today', { today: todayStr })
      .getMany();
  }
}
