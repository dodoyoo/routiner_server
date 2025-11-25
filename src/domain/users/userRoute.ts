import { Router } from 'express';
import { UserController } from './userController';
import { authMiddleware } from '../../utils/jwtAuth';

const router = Router();
const userController = new UserController();

router.get('/google/login', (req, res) => userController.googleLogin(req, res));

router.get('/google/callback', (req, res) =>
  userController.googleCallback(req, res)
);

router.get('/kakao/login', (req, res) => userController.kakaoLogin(req, res));

router.get('/kakao/callback', (req, res) =>
  userController.kakaoCallback(req, res)
);

router.get('/api/users/me', authMiddleware, (req, res) =>
  userController.getUserById(req, res)
);

router.post('/api/sign-in', (req, res) => userController.testSignIn(req, res));

export default router;
