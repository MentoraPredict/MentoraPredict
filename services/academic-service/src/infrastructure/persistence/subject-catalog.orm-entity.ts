import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CareerOrmEntity } from './career.orm-entity';

/**
 * Catálogo de materias — existe una vez, independiente del período
 * (docs/database/database-update-plan.md §5.1). `subjects` pasa a ser la
 * oferta period-scoped de una fila de este catálogo.
 */
@Entity('subject_catalog')
export class SubjectCatalogOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 200 }) name!: string;
  @Column({ type: 'text', default: '' }) description!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column({ default: 0 }) credits!: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) area!: string | null;

  @Column({ name: 'career_id', type: 'uuid', nullable: true }) careerId!: string | null;
  @ManyToOne(() => CareerOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'career_id', foreignKeyConstraintName: 'FK_subject_catalog_career_id' })
  career?: CareerOrmEntity | null;

  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
