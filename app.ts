import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import userRouter from './src/domain/users/userRoute';
import routineRouter from './src/domain/routines/routineRoute';
import userRoutineRouter from './src/domain/userRoutines/userRoutineRoute';
import routineTimeRouter from './src/domain/routineTimes/routineTimeRoute';
import statisticRoutineRouter from './src/domain/statisticRoutines/statisticRoutineRoute';
import couponRouter from './src/domain/rewards/couponRoute';

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
  app.use(routineRouter);
  app.use(userRoutineRouter);
  app.use(routineTimeRouter);
  app.use(statisticRoutineRouter);
  app.use(couponRouter);

  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
  });
  return app;
};
