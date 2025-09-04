import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { subcriptions } from '../helpers/config';

@Entity({ name: 'subcriptions', schema: 'private' })
export class SubcriptionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Whether custom SMTP is enabled
  @Column({ type: 'boolean', default: false })
  isFree!: boolean;

  // Sender Information
  @Column({
    type: 'enum',
    nullable: false,
    default: subcriptions[0],
    enum: subcriptions,
  })
  name!: string;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: () => `'{"monthly": 0, "yearly": 0}'`,
  })
  price!: { monthly: number; yearly: number };

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true, array: true })
  features!: string[];

  @Column({ type: 'varchar', length: 50, nullable: false })
  buttonLabel!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
