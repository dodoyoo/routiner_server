import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/userEntity';
import { GiftItems } from './giftItemEntity';

@Entity('gift_records')
export class CouponRecords {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @Column({ type: 'integer', nullable: false })
  gift_item_id!: number;

  @Column({ type: 'integer' })
  coupon_spent!: number;

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

  @ManyToOne(() => User, (user) => user.couponRecords)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => GiftItems, (giftItem) => giftItem.couponRecords)
  @JoinColumn({ name: 'gift_item_id' })
  giftItem!: GiftItems;
}
