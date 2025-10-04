import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
