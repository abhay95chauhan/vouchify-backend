import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { OrganizationEntity } from '../../organization/entity/entity';

@Entity({ name: 'api-keys', schema: 'public' })
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: false })
  api_key!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  api_secret!: string;

  // 🔑 Relation to organization
  @OneToOne(() => OrganizationEntity, {
    onDelete: 'CASCADE', // 🚀 Auto-delete when org deleted
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column({ type: 'uuid', nullable: false, unique: true })
  organization_id!: string;

  @Column({ type: 'uuid', nullable: false, unique: true })
  user_id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
