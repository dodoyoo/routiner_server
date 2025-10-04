import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserRoutines } from '../userRoutines/userRoutineEntity';

@Entity('routines')
export class Routines {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  description!: string;

  @Column({ type: 'varchar', length: 2048, nullable: false })
  icon_url!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  category!: string;

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

  @OneToMany(() => UserRoutines, (userRoutine) => userRoutine.routine)
  userRoutines!: UserRoutines[];
}
