import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('device_tokens')
@Index('idx_device_token_user', ['userId'])
export class DeviceTokenOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ name: 'expo_push_token', type: 'varchar', length: 255, unique: true })
  expoPushToken!: string;
  @Column({ type: 'varchar', length: 10 }) platform!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
