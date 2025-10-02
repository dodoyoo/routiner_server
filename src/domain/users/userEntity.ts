import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn()
  id!: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  email!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  password!: string;

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
}
