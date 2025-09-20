import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationEntity } from '../../organization/entity/entity';
import { VouchersEntity } from '../../vouchers/entity/entity';
import { voucherRedeemStatus } from '../helpers/config';

@Entity({ name: 'voucher-redemptions', schema: 'public' })
export class VoucherRedemptionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ✅ Link to Voucher
  @ManyToOne(() => VouchersEntity, {
    onDelete: 'CASCADE', // delete redemptions if voucher is deleted
  })
  @JoinColumn({ name: 'voucher_id' })
  voucher!: VouchersEntity;

  @Column({ type: 'uuid', nullable: false })
  voucher_id!: string;

  // ✅ Link to Organization
  @ManyToOne(() => OrganizationEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column({ type: 'uuid', nullable: false })
  organization_id!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_name?: string; // fallback if no user_id

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_email?: string; // fallback if no user_id

  // ✅ Order or transaction details
  @Column({ type: 'varchar', length: 100, nullable: true })
  order_id?: string;

  @Column({ type: 'int', nullable: false })
  order_amount!: number;

  @Column({ type: 'int', nullable: false })
  discount_amount!: number;

  @Column({ type: 'int', nullable: false })
  final_payable_amount!: number; // after discount

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent?: string;
  // ✅ Status in case of refunds/rollbacks
  @Column({
    type: 'enum',
    default: voucherRedeemStatus[0],
    enum: voucherRedeemStatus,
  })
  status!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
