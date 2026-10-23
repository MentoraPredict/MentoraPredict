import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AiSettingsPatch,
  AiSettingsRecord,
  IAiSettingsRepository,
} from '../../domain/ports/i-ai-settings.repository';
import { AiSettingsOrmEntity } from './ai-settings.orm-entity';

const SINGLETON_ID = 1;

@Injectable()
export class AiSettingsRepository implements IAiSettingsRepository {
  constructor(
    @InjectRepository(AiSettingsOrmEntity)
    private readonly repo: Repository<AiSettingsOrmEntity>,
  ) {}

  async get(): Promise<AiSettingsRecord> {
    const row = await this.repo.findOne({ where: { id: SINGLETON_ID } });
    return row ? this.toRecord(row) : this.defaults();
  }

  async save(patch: AiSettingsPatch): Promise<AiSettingsRecord> {
    const current = (await this.repo.findOne({ where: { id: SINGLETON_ID } })) ?? this.repo.create({
      id: SINGLETON_ID,
      encryptedApiKey: null,
      keyLast4: null,
      model: null,
      enabled: true,
      updatedBy: null,
    });

    Object.assign(current, patch, { updatedAt: new Date() });
    return this.toRecord(await this.repo.save(current));
  }

  private defaults(): AiSettingsRecord {
    return {
      encryptedApiKey: null,
      keyLast4: null,
      model: null,
      enabled: true,
      updatedBy: null,
      updatedAt: null,
    };
  }

  private toRecord(row: AiSettingsOrmEntity): AiSettingsRecord {
    return {
      encryptedApiKey: row.encryptedApiKey,
      keyLast4: row.keyLast4,
      model: row.model,
      enabled: row.enabled,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt,
    };
  }
}