import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { discountType, redeemPerUser } from '../helpers/config';

@Entity({ name: 'vouchers', schema: 'public' })
export class VouchersEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  prefix?: string;

  @Column({ type: 'text', nullable: true })
  postfix?: string;

  @Column({ type: 'text', unique: true, nullable: false })
  code!: string;

  @Column({
    type: 'enum',
    nullable: false,
    default: discountType[1],
    enum: discountType,
  })
  discount_type!: string;

  @Column({ type: 'int', nullable: false })
  discount_value!: number;

  @Column({ type: 'int', nullable: true })
  max_redemptions?: number | null;

  @Column({ type: 'int', default: 0 })
  redemption_count!: number;

  @Column({ type: 'int', default: 0 })
  min_order_amount!: number;

  @CreateDateColumn({ type: 'date' })
  start_date!: string;

  @CreateDateColumn({ type: 'date' })
  end_date!: string;

  @Column({ type: 'uuid', nullable: false })
  organization_id!: string; // 👈 plain column

  @Column({
    type: 'enum',
    nullable: true,
    default: redeemPerUser[1],
    enum: redeemPerUser,
  })
  redeem_limit_per_user?: string;

  @Column({ type: 'int', nullable: true, default: null })
  max_discount_amount?: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
