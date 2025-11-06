import 'reflect-metadata';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/userEntity';
import { UserRoutines } from '../userRoutines/userRoutineEntity';

export type CouponStatus = 'issued' | 'redeemed' | 'expired';

@Entity('coupons')
@Unique('uniq_coupon_period', [
  'user_id',
  'user_routine_id',
  'period_start',
  'period_end',
])
export class Coupons {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @Column({ type: 'integer', nullable: false })
  user_routine_id!: number;

  @Column({ type: 'date', nullable: false })
  period_start!: Date;

  @Column({ type: 'date', nullable: false })
  period_end!: Date;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'issued' })
  status!: CouponStatus;

  @Column({ type: 'timestamp', nullable: true })
  redeemed_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issued_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.coupons)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => UserRoutines, (userRoutine) => userRoutine.coupons)
  @JoinColumn({ name: 'user_routine_id' })
  userRoutines!: UserRoutines;
}
