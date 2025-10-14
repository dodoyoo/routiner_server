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

  public async createUserRoutines(data: {
    user_id: number;
    routine_id: number;
    start_date: Date;
    end_date: Date;
  }) {
    const { user_id, routine_id } = data;

    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundDataError('존재하지 않는 사용자입니다.');
    }

    const existingRoutines = await this.repository.findOne({
      where: { user_id: data.user_id, routine_id: data.routine_id },
    });

    if (existingRoutines) {
      throw new DuplicatePropertyError('이미 선택한 루틴입니다.');
    }

    const newRoutines = this.repository.create({ ...data, is_active: true });

    return await this.repository.save(newRoutines);
  }

  public async findUserRoutines(user_id: number) {
    try {
      const routines = await this.repository
        .createQueryBuilder('user_routine')
        .leftJoinAndSelect('user_routine.routine', 'routine')
        .where('user_routine.user_id = :user_id', { user_id })
        .orderBy('user_routine.start_date', 'DESC')
        .getMany();

      return routines;
    } catch (error) {
      console.error('루틴을 불러오는데 실패했습니다.', error);
      throw new Error('Failed to get routines');
    }
  }
}
