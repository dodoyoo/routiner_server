import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../domain/users/userEntity';
import { UserRoutines } from '../domain/userRoutines/userRoutineEntity';
import { RoutineTimes } from '../domain/routineTimes/routineTimeEntity';
import { Routines } from '../domain/routines/routineEntity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: true,
  synchronize: false,
  entities: [User, Routines, UserRoutines, RoutineTimes],
  migrations: ['src/models/migration/*.ts'],
  migrationsRun: true,
});
