import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { userRoles } from '../helpers/config';
import { OrganizationEntity } from '../../organization/entity/entity';
import bcrypt from 'bcryptjs';

@Entity({ name: 'users', schema: 'public' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  full_name!: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  password!: string;

  @Column({
    type: 'enum',
    nullable: false,
    default: userRoles[0],
    enum: userRoles,
  })
  role!: string;

  @Column({ type: 'bigint', nullable: true })
  phone_number?: number;

  @Column({ type: 'varchar', nullable: true, default: '' })
  avatar_url?: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  is_active!: boolean;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_email_varified!: boolean;

  @Column({ type: 'uuid', nullable: true })
  organization_id?: string; // 👈 plain column

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' }) // This creates the column in DB
  organization?: OrganizationEntity;

  @CreateDateColumn({ type: 'timestamp' })
  joined_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at?: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
