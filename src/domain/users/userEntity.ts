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
import { RoutineTimes } from '../routineTimes/routineTimeEntity';
import { UserRoutines } from '../userRoutines/userRoutineEntity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  email!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  google_id!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  kakao_id!: string;

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

  @OneToMany(() => UserRoutines, (userRoutine) => userRoutine.user)
  userRoutines!: UserRoutines[];

  @OneToMany(() => RoutineTimes, (routineTime) => routineTime.user)
  routineTimes!: RoutineTimes[];
}
