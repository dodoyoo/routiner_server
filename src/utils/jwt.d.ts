import { JwtPayload } from 'jsonwebtoken';

export interface JwtUserPayload extends JwtPayload {
  userId: number;
  provider: 'google' | 'kakao' | 'local';
}
