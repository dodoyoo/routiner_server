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
      return res.status(404).json({ message: '구글 로그인 실패' });
    }
  }

  async kakaoLogin(req: Request, res: Response) {
    const clientId = process.env.KAKAO_CLIENT_ID!;
    const redirectUri = process.env.KAKAO_REDIRECT_URI!;

    const scope = ['profile_nickname', 'profile_image', 'account_email'].join(
      ' '
    );

    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri!
    )}&scope=${encodeURIComponent(scope)}`;

    console.log('@@@@@@@@@@@@@@@@@@@@:   ', clientId);
    console.log('#####################:       ', url);
    return res.redirect(url);
  }

  async kakaoCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;

      const redirectUri = process.env.KAKAO_REDIRECT_URI!;
      const clientId = process.env.KAKAO_CLIENT_ID;

      if (!clientId || !redirectUri) {
        throw new Error(
          'KAKAO_REST_API_KEY 또는 KAKAO_REDIRECT_URI가 설정되어 있지 않습니다.'
        );
      }

      const tokenParams = new URLSearchParams();
      tokenParams.append('grant_type', 'authorization_code');
      tokenParams.append('client_id', clientId);
      tokenParams.append('redirect_uri', redirectUri);
      tokenParams.append('code', code);

      const tokenResponse = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        tokenParams,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }
      );
      const { access_token } = tokenResponse.data;

      // 2) 액세스 토큰으로 유저 정보 조회
      const userInfoResponse = await axios.get(
        'https://kapi.kakao.com/v2/user/me',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }
      );

      const kakaoData = userInfoResponse.data;

      const kakaoId = String(kakaoData.id);
      const kakaoAccount = kakaoData.kakao_account || {};
      const email = kakaoAccount.email || null;

      let user = await this.userRepository.findByKakaoId(kakaoId);

      if (!user) {
        user = await this.userRepository.saveUser({
          kakao_id: kakaoId,
          email,
        });
      }

      return res.json({
        message: '카카오 로그인 성공',
        user,
      });
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      return res.status(400).json({ message: '카카오 로그인 실패' });
    }
  }
}
