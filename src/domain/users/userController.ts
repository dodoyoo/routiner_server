import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JwtUserPayload } from '../../utils/jwt';
import { UserRepository } from './userRepository';
import {
  InvalidPropertyError,
  PropertyRequiredError,
} from '../../utils/customError';
import { reportErrorMessage } from '../../utils/errorHandling';
import { User } from './userEntity';

const comparePassword = async (
  inputPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(inputPassword, storedPassword);
};

const emailRegex =
  /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-z\d!@#$%^&*(),.?":{}|<>]{10,}$/;

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

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
      const code = req.query.code as string | undefined;

      if (!code) {
        console.error('구글 콜백에 Code가 없습니다.', req.query);
        return res
          .status(400)
          .json({ message: 'code 쿼리 파라미터가 없습니다.' });
      }
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

      const { id, email, name, picture } = userInfoResponse.data;

      let user = await this.userRepository.findByGoogleId(id);

      if (!user) {
        user = await this.userRepository.saveUser({
          google_id: id,
          email,
          nickname: name,
          profile_image_url: picture,
        });
      } else {
        let needSave = false;

        if (!user.nickname && name) {
          user.nickname = name;
          needSave = true;
        }

        if (!user.profile_image_url && picture) {
          user.profile_image_url = picture;
          needSave = true;
        }

        if (needSave) {
          user = await this.userRepository.saveUser(user);
        }
      }

      const payload: JwtUserPayload = {
        userId: user.id,
        provider: 'google',
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
        expiresIn: '1h',
      });

      return res.json({
        message: '구글 로그인 성공',
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profile_image_url,
          createAt: user.created_at,
        },
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

      const payload: JwtUserPayload = {
        userId: user.id,
        provider: 'kakao',
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
        expiresIn: '1h',
      });

      return res.json({
        message: '카카오 로그인 성공',
        user,
      });
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      return res.status(400).json({ message: '카카오 로그인 실패' });
    }
  }

  public async getUserById(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(400).json({ message: 'userId가 필요합니다' });
      }

      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      const couponCount = user.coupons ? user?.coupons.length : 0;

      const userRoutines = user.userRoutines || [];

      const completedRoutineCount = userRoutines.filter(
        (ur) => ur.is_active
      ).length;

      const activeRoutineCount = userRoutines.filter(
        (ur) => ur.is_active
      ).length;

      const streakDays = 0;

      return res.status(200).json({
        message: '마이페이지 불러오기 성공',
        data: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profile_image_url,
          couponCount,
          streakDays,
          completedRoutineCount,
          activeRoutineCount,
          createdAt: user.created_at,
        },
      });
    } catch (err: unknown) {
      return reportErrorMessage(err, res);
    }
  }

  public async testSignIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const emailRegex =
        /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
      if (!emailRegex.test(email)) {
        throw new InvalidPropertyError('잘못된 이메일 형식입니다.');
      }

      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new InvalidPropertyError('존재하지 않는 이메일');
      }

      const isPasswordValid: boolean = await comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        throw new InvalidPropertyError('비밀번호가 일치하지 않습니다.');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET_KEY!,
        {
          expiresIn: '7d',
        }
      );
      console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);

      res.status(200).json({
        message: '로그인 성공',
        user: {
          token,
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profile_image_url,
        },
      });
    } catch (err: unknown) {
      return reportErrorMessage(err, res);
    }
  }

  async getMyProfile(req: Request, res: Response) {
    try {
      const userPayload = req.user as JwtUserPayload;
      const userId = userPayload.userId;

      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      // 필요하면 쿠폰/루틴 카운트 추가
      const couponCount = user.coupons?.length ?? 0;
      const completedRoutineCount =
        user.userRoutines?.filter((r) => r.is_active === true).length ?? 0;
      const activeRoutineCount =
        user.userRoutines?.filter((r) => r.is_active === false).length ?? 0;

      return res.json({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profile_image_url,
        couponCount,
        completedRoutineCount,
        activeRoutineCount,
        createdAt: user.created_at,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '서버 에러' });
    }
  }
}
