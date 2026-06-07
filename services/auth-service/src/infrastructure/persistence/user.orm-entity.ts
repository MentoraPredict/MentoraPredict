import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export type OrmUserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ type: 'varchar', default: 'STUDENT' })
  role!: OrmUserRole;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column({ name: 'first_name', length: 100, default: '' })
  firstName!: string;

  @Column({ name: 'last_name', length: 100, default: '' })
  lastName!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
