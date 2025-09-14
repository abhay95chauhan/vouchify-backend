import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { discountType, redeemPerUser } from '../helpers/config';
import { OrganizationEntity } from '../../organization/entity/entity';

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

  @ManyToOne(() => OrganizationEntity, {
    onDelete: 'CASCADE', // 🚀 Auto-delete when org deleted
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

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

  @Column({ type: 'text', nullable: true, array: true })
  eligible_products!: string[];

  @Column({ type: 'timestamptz', nullable: true })
  last_redeemed_at?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
