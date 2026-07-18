import { Entity, PrimaryColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn, Check } from 'typeorm';
import { UserReferenceOrmEntity } from '../../../infrastructure/persistence/user-reference.orm-entity';

@Entity('device_tokens')
@Index('idx_device_token_user', ['userId'])
@Check('CHK_device_tokens_platform', `"platform" IN ('ios','android','web')`)
export class DeviceTokenOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ name: 'expo_push_token', type: 'varchar', length: 255, unique: true })
  expoPushToken!: string;
  @Column({ type: 'varchar', length: 10 }) platform!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_device_tokens_user_id' })
  user?: UserReferenceOrmEntity;
}
