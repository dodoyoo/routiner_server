import { Repository, Raw } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { RoutineTimes } from './routineTimeEntity';

export class RoutineTimeRepository {
  private repository: Repository<RoutineTimes>;

  constructor(dataSource = AppDataSource) {
    this.repository = dataSource.getRepository(RoutineTimes);
  }

  public async routineComplete(
    user_id: number,
    user_routine_id: number
  ): Promise<RoutineTimes> {
    const today = new Date();
    const todayDate1 = new Date(today.toISOString().split('T')[0] as string);

    const existing = await this.repository.findOne({
      where: { user_id, user_routine_id, date: todayDate1 },
    });

    if (existing) {
      existing.progress = 100;
      existing.updated_at = new Date();
      return await this.repository.save(existing);
    }

    const newRecord = this.repository.create({
      user_id,
      user_routine_id,
      date: todayDate1 as unknown as Date,
      progress: 100,
    });

    return await this.repository.save(newRecord);
  }

  // 사용자 금일 루틴 진행 상태 조회
  public async getTodayRoutineStatus(user_id: number) {
    const today2 = new Date().toISOString().split('T')[0];

    return await this.repository.find({
      where: {
        user_id,
        date: Raw((alias) => `${alias} = '${today2}'`),
      },
      relations: ['userRoutine', 'userRoutine.routine'],
    });
  }

  // -> 쿼리빌더 사용시
  // public async getTodayRoutineStatus(user_id: number) {
  //   return await this.repository
  //     .createQueryBuilder('routine_time')
  //     .leftJoinAndSelect('routine_time.userRoutine', 'userRoutine')
  //     .leftJoinAndSelect('userRoutine.routine', 'routine')
  //     .where('routine_time.user_id = :user_id', { user_id })
  //     .andWhere('DATE(routine_time.date) = CURDATE()')
  //     .getMany();
  // }

  // 00시 기준 자동 실패 처리
  public async routineFailed(user_id: number, user_routine_id: number) {
    const today3 = new Date().toISOString().split('T')[0]!;
    const todayDate3 = new Date(today3);
    const exist = await this.repository.findOne({
      where: { user_id, user_routine_id, date: todayDate3 },
    });

    if (!exist) {
      const failedRecord = this.repository.create({
        user_id,
        user_routine_id,
        date: todayDate3,
        progress: 0,
      });
      return await this.repository.save(failedRecord);
    }
    return exist;
  }
}
