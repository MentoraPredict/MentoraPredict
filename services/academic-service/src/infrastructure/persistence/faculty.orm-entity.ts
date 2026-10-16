import { Entity, PrimaryColumn, Column, Check, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('faculties')
@Check('CHK_faculties_status', `"status" IN ('ACTIVE','INACTIVE')`)
export class FacultyOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 200, unique: true }) name!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column({ type: 'text', default: '' }) description!: string;
  @Column({ length: 20, default: 'ACTIVE' }) status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
