import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtUserPayload } from './jwt';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer')
    ? authHeader.split(' ')[1]
    : undefined;

  if (!token) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as JwtUserPayload;

    req.user = decoded;
    console.log('로그인 사용자 정보:  ', req.user);
    next();
  } catch (err) {
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
