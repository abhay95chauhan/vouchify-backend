import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'smtp_settings', schema: 'public' })
export class SmtpSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Whether custom SMTP is enabled
  @Column({ type: 'boolean', default: false })
  enabled!: boolean;

  // Sender Information
  @Column({ type: 'varchar', length: 255, nullable: false })
  sender_email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  sender_name!: string;

  // SMTP Provider Settings
  @Column({ type: 'varchar', length: 255, nullable: false })
  host!: string;

  @Column({ type: 'int', nullable: false })
  port!: number;

  @Column({ type: 'boolean', default: true })
  secure!: boolean; // true for 465, false for other ports

  @Column({ type: 'varchar', length: 255, nullable: false })
  username!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string; // ⚠️ store encrypted, not plain

  // Optional organization-level scoping
  @Column({ type: 'uuid', nullable: false })
  organization_id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
