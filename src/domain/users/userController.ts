import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { UserRepository } from './userRepository';
import {
  InvalidPropertyError,
  PropertyRequiredError,
} from '../../utils/customError';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async googleLogin(req: Request, res: Response) {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');

    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    return res.redirect(url);
  }

  async googleCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;

      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { access_token } = tokenResponse.data;

      const userInfoResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const { id, email } = userInfoResponse.data;

      let user = await this.userRepository.findByGoogleId(id);

      if (!user) {
        user = await this.userRepository.saveUser({
          google_id: id,
          email,
        });
      }

      return res.json({
        message: '구글 로그인 성공',
        user,
      });
    } catch (error) {
      console.error('구글 로그인 실패:', error);
      return res.status(500).json({ message: '구글 로그인 실패' });
    }
  }
}
