import { Entity, PrimaryColumn, Column } from 'typeorm';

/** Una sola fila (id = 1): configuración de la IA editable desde administración. */
@Entity('ai_settings')
export class AiSettingsOrmEntity {
  @PrimaryColumn({ type: 'smallint' }) id!: number;

  @Column({ name: 'encrypted_api_key', type: 'text', nullable: true }) encryptedApiKey!: string | null;

  @Column({ name: 'key_last4', type: 'varchar', length: 8, nullable: true }) keyLast4!: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true }) model!: string | null;

  @Column({ type: 'boolean', default: true }) enabled!: boolean;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true }) updatedBy!: string | null;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' }) updatedAt!: Date;
}