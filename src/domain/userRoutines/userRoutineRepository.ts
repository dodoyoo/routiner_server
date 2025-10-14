import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { UserRoutines } from './userRoutineEntity';

export class UserRoutineRepository {
  private repository: Repository<UserRoutines>;

  constructor(dataSource = AppDataSource) {
    this.repository = dataSource.getRepository(UserRoutines);
  }

  public async createUserRoutine(data: {
    user_id: number;
    routine_id: number;
    start_date: Date;
    end_date: Date;
  }) {
    const existingRoutines = await this.repository.findOne({
      where: { user_id: data.user_id, routine_id: data.routine_id },
    });

    if (existingRoutines) {
      throw new Error('이미 선택한 루틴입니다.');
    }

    const newRoutines = this.repository.create({ ...data, is_active: true });

    return await this.repository.save(newRoutines);
  }
}
