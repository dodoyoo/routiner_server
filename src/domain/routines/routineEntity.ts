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
import { Categories } from './categoryEntity';

@Entity('routines')
export class Routines {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  description!: string;

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

  @ManyToOne(() => Categories, (category) => category.routines)
  @JoinColumn({ name: 'category_id' })
  category!: Categories;
}
