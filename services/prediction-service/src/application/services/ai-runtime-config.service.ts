import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiSettingsRepository } from '../../domain/ports/i-ai-settings.repository';
import { ISecretCipher } from '../ports/output/i-secret-cipher.port';

export const AI_SETTINGS_REPO = 'IAiSettingsRepository';
export const SECRET_CIPHER = 'ISecretCipher';

export const DEFAULT_AI_MODEL = 'gpt-4o-mini';

export type AiKeySource = 'database' | 'environment' | 'none';

export interface AiRuntimeConfig {
  apiKey: string;
  model: string;
  /** Interruptor general: apagado, el sistema usa solo las recomendaciones por reglas. */
  enabled: boolean;
  source: AiKeySource;
}

const CACHE_MS = 30_000;

/**
 * Configuración efectiva de la IA. La clave guardada desde el panel de
 * administración tiene prioridad sobre la variable de entorno OPENAI_API_KEY.
 */
@Injectable()
export class AiRuntimeConfigService {
  private cache: { value: AiRuntimeConfig; expiresAt: number } | null = null;

  constructor(
    @Inject(AI_SETTINGS_REPO) private readonly settings: IAiSettingsRepository,
    @Inject(SECRET_CIPHER) private readonly cipher: ISecretCipher,
    private readonly config: ConfigService,
  ) {}

  invalidate(): void {
    this.cache = null;
  }

  async resolve(): Promise<AiRuntimeConfig> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.value;

    const record = await this.settings.get();
    const envKey = this.config.get<string>('OPENAI_API_KEY', '').trim();
    const envModel = this.config.get<string>('OPENAI_MODEL', DEFAULT_AI_MODEL);

    let apiKey = '';
    let source: AiKeySource = 'none';
    if (record.encryptedApiKey) {
      apiKey = this.cipher.decrypt(record.encryptedApiKey);
      source = 'database';
    } else if (envKey) {
      apiKey = envKey;
      source = 'environment';
    }

    const value: AiRuntimeConfig = {
      apiKey,
      model: record.model || envModel || DEFAULT_AI_MODEL,
      enabled: record.enabled,
      source,
    };
    this.cache = { value, expiresAt: Date.now() + CACHE_MS };
    return value;
  }
}