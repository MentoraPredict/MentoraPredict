import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('subjects')
export class SubjectOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 200 }) name!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column() credits!: number;
  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;
  @Column({ name: 'teacher_id', type: 'uuid', nullable: true }) teacherId!: string | null;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
