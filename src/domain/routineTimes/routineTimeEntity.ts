import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/userEntity';
import { UserRoutines } from '../userRoutines/userRoutineEntity';

export class RoutineTimes {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @Column({ type: 'integer', nullable: false })
  user_routine_id!: number;

  @Column({ type: 'date', nullable: false })
  date!: Date;

  @Column({ type: 'integer', nullable: false })
  progress!: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.routineTimes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => UserRoutines, (userRoutine) => userRoutine.routineTimes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_routine_id' })
  userRoutine!: UserRoutines;
}
