import { Router } from 'express';
import { UserController } from './userController';

const router = Router();
const userController = new UserController();

router.get('/google/login', (req, res) => userController.googleLogin(req, res));

router.get('/google/callback', (req, res) =>
  userController.googleCallback(req, res)
);

export default router;
