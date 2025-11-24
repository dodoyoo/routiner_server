import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { User } from './userEntity';
import { Coupons } from '../rewards/couponEntity';

export class UserRepository {
  private repository: Repository<User>;

  constructor(dataSource = AppDataSource) {
    this.repository = dataSource.getRepository(User);
  }

  async findByGoogleId(googleId: string) {
    return this.repository.findOne({ where: { google_id: googleId } });
  }

  async findByKakaoId(kakaoId: string) {
    return this.repository.findOne({ where: { kakao_id: kakaoId } });
  }

  async findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }

  async saveUser(userData: Partial<User>) {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      const user = await this.repository.findOne({
        where: { id: userId },
        relations: ['coupons', 'userRoutines', 'userRoutines.routineTimes'],
      });

      return user;
    } catch (error) {
      console.error('getUserById 실패', error);
      throw error;
    }
  }
}
