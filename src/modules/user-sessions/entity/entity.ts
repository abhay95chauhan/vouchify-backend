import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entity/entity';

@Entity({ name: 'user-sessions', schema: 'public' })
export class UserSessionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  user_id!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'text' })
  token!: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string | null;

  @Column({ type: 'inet', nullable: true })
  ip_address?: string | null;

  @Column({ type: 'timestamptz' })
  expires_at!: Date;

  @Column({ type: 'boolean', default: false })
  revoked!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
