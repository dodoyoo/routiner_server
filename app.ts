import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import userRouter from './src/domain/users/userRoute';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: '*',
    })
  );
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(compression());

  app.use(userRouter);

  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
  });
  return app;
};
