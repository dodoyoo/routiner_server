import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { Routines } from './routineEntity';

export class RoutineRepository {
  private repository: Repository<Routines>;

  constructor(dataSource = AppDataSource) {
    this.repository = dataSource.getRepository(Routines);
  }

  public async findAllRoutines(
    page: number = 1,
    pageSize: number = 10
  ): Promise<Routines[]> {
    try {
      const routines = await this.repository
        .createQueryBuilder('routine')
        .select([
          'routine.id',
          'routine.title',
          'routine.description',
          'routine.icon_url',
          'routine.category',
          'routine.created_at',
          'routine.updated_at',
        ])
        .orderBy('routine.created_at', 'ASC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();
      return routines;
    } catch (error) {
      console.error('루틴을 불러오는데 실패했습니다.', error);
      throw new Error('Failed to get all routines');
    }
  }

  public async findRoutinesByCategory(
    category: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Routines[]> {
    try {
      const routines = await this.repository
        .createQueryBuilder('routine')
        .select([
          'routine.id',
          'routine.title',
          'routine.description',
          'routine.icon_url',
          'routine.category',
          'routine.created_at',
          'routine.updated_at',
        ])
        .where('routine.category = :category', { category })
        .orderBy('routine.created_at', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      return routines;
    } catch (error) {
      console.error('카테고리별 루틴 조회 실패:', error);
      throw new Error('Failed to get routines by category');
    }
  }
}
