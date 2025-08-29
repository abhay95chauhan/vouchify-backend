import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeInsert,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import {
  subcriptionCost,
  subcriptions,
  subcriptionStatus,
} from '../helpers/config';
import { ApiKeyEntity } from '../../api-key/entity/entity';

@Entity({ name: 'organization', schema: 'public' })
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  industry!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  organization_type!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  currency!: string;

  @Column({ type: 'varchar', length: 5, nullable: false })
  currency_symbol!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  timezone!: string;

  @Column({ type: 'uuid', nullable: true })
  api_key_id?: string; // 👈 plain column

  @OneToOne(() => ApiKeyEntity, { nullable: true })
  @JoinColumn({ name: 'api_key_id' })
  api_keys?: ApiKeyEntity;

  @Column({
    type: 'enum',
    nullable: false,
    default: subcriptions[0],
    enum: subcriptions,
  })
  subcription!: string;

  @Column({
    type: 'enum',
    nullable: false,
    default: subcriptionStatus[0],
    enum: subcriptionStatus,
  })
  subcription_status!: string;

  @Column({
    type: 'enum',
    nullable: false,
    default: subcriptionCost[0],
    enum: subcriptionCost,
  })
  subcription_cost!: number;

  @Column({ type: 'timestamp', nullable: true })
  subcription_expire!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @BeforeInsert()
  generateSlug() {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .trim()
      .replace(/\s+/g, '-') // spaces to dash
      .replace(/-+/g, '-'); // collapse multiple dashes
  }
}
