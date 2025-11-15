import { Repository } from 'typeorm';
import { AppDataSource } from '../../models/dataSource';
import { User } from './userEntity';

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
}
