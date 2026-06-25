import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';

@Entity('user_profiles')
export class UserProfileOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ type: 'varchar', nullable: true }) photo!: string | null;
  @Column({ type: 'text', nullable: true }) bio!: string | null;
  @Column({ type: 'varchar', unique: true, nullable: true }) cedula!: string | null;
  @Column({ name: 'auth_provider', type: 'varchar', default: 'LOCAL' }) authProvider!: string;
  @Column({ type: 'varchar', default: 'STUDENT' }) role!: string;
  @Column({ type: 'varchar', default: 'ACTIVE' }) status!: string;
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true }) deletedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
