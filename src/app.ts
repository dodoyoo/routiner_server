import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import userRouter from './domain/users/userRoute';
import routineRouter from './domain/routines/routineRoute';
import userRoutineRouter from './domain/userRoutines/userRoutineRoute';
import routineTimeRouter from './domain/routineTimes/routineTimeRoute';
import statisticRoutineRouter from './domain/statisticRoutines/statisticRoutineRoute';
import couponRouter from './domain/rewards/couponRoute';

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
  app.use(express.urlencoded({ extended: true }));

  const publicDir =
    process.env.PUBLIC_DIR ?? path.resolve(process.cwd(), 'public');

  app.use(express.static(publicDir));

  app.use(userRouter);
  app.use(routineRouter);
  app.use(userRoutineRouter);
  app.use(routineTimeRouter);
  app.use(statisticRoutineRouter);
  app.use(couponRouter);

  app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
  });
  return app;
};
