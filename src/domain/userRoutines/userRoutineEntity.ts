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
import { Routines } from '../routines/routineEntity';
import { RoutineTimes } from '../routineTimes/routineTimeEntity';

@Entity('user_routines')
export class UserRoutines {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @Column({ type: 'integer', nullable: false })
  routine_id!: number;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({ type: 'boolean', nullable: true, default: 0 })
  is_active: boolean = false;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.userRoutines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Routines, (routine) => routine.userRoutines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routine_id' })
  routine!: Routines;

  @OneToMany(() => RoutineTimes, (routineTime) => routineTime.userRoutine)
  routineTimes!: RoutineTimes[];
}
