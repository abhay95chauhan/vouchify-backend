import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrganizationEntity } from '../../organization/entity/entity';

@Entity({ name: 'email-templates', schema: 'public' })
export class EmailTemplatesEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  subject!: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: '' })
  category!: string;

  @Column({ type: 'varchar', nullable: false })
  html!: string;

  @ManyToOne(() => OrganizationEntity, {
    onDelete: 'CASCADE', // 🚀 Auto-delete when org deleted
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column({ type: 'uuid', nullable: false })
  organization_id!: string; // 👈 plain column

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
