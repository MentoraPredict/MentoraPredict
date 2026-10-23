import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IAiSettingsRepository } from '../../domain/ports/i-ai-settings.repository';
import { IAiUsageRepository, AiUsageSummary } from '../../domain/ports/i-ai-usage.repository';
import { IAiConnectionChecker, AiConnectionCheck } from '../ports/output/i-ai-connection-checker.port';
import { ISecretCipher } from '../ports/output/i-secret-cipher.port';
import {
  AI_SETTINGS_REPO,
  AiKeySource,
  AiRuntimeConfigService,
  DEFAULT_AI_MODEL,
  SECRET_CIPHER,
} from '../services/ai-runtime-config.service';

export const AI_USAGE_REPO = 'IAiUsageRepository';
export const AI_CONNECTION_CHECKER = 'IAiConnectionChecker';

export interface AiSettingsView {
  configured: boolean;
  source: AiKeySource;
  keyLast4: string | null;
  model: string;
  defaultModel: string;
  enabled: boolean;
  updatedAt: string | null;
}

export interface UpdateAiSettingsInput {
  /** Clave nueva. Vacía o ausente = no cambiarla. */
  apiKey?: string;
  /** Borra la clave guardada (vuelve a usarse la variable de entorno, si existe). */
  clearApiKey?: boolean;
  model?: string;
  enabled?: boolean;
}

const MODEL_PATTERN = /^[A-Za-z0-9._:-]{1,60}$/;
const KEY_PATTERN = /^sk-[A-Za-z0-9_-]{16,}$/;

@Injectable()
export class GetAiSettingsUseCase {
  constructor(
    @Inject(AI_SETTINGS_REPO) private readonly settings: IAiSettingsRepository,
    private readonly runtime: AiRuntimeConfigService,
  ) {}

  async execute(): Promise<AiSettingsView> {
    const record = await this.settings.get();
    this.runtime.invalidate();
    const effective = await this.runtime.resolve();

    return {
      configured: effective.source !== 'none',
      source: effective.source,
      keyLast4: record.keyLast4,
      model: effective.model,
      defaultModel: DEFAULT_AI_MODEL,
      enabled: effective.enabled,
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : null,
    };
  }
}

@Injectable()
export class UpdateAiSettingsUseCase {
  constructor(
    @Inject(AI_SETTINGS_REPO) private readonly settings: IAiSettingsRepository,
    @Inject(SECRET_CIPHER) private readonly cipher: ISecretCipher,
    private readonly runtime: AiRuntimeConfigService,
    private readonly getSettings: GetAiSettingsUseCase,
  ) {}

  async execute(input: UpdateAiSettingsInput, adminId: string): Promise<AiSettingsView> {
    const patch: Parameters<IAiSettingsRepository['save']>[0] = { updatedBy: adminId };

    const apiKey = input.apiKey?.trim();
    if (apiKey) {
      if (!KEY_PATTERN.test(apiKey)) {
        throw new BadRequestException('La clave no tiene el formato de una clave de OpenAI (empieza con "sk-").');
      }
      patch.encryptedApiKey = this.cipher.encrypt(apiKey);
      patch.keyLast4 = apiKey.slice(-4);
    } else if (input.clearApiKey) {
      patch.encryptedApiKey = null;
      patch.keyLast4 = null;
    }

    if (input.model !== undefined) {
      const model = input.model.trim();
      if (model && !MODEL_PATTERN.test(model)) {
        throw new BadRequestException('El nombre del modelo no es válido.');
      }
      patch.model = model || null;
    }

    if (input.enabled !== undefined) {
      patch.enabled = Boolean(input.enabled);
    }

    await this.settings.save(patch);
    this.runtime.invalidate();
    return this.getSettings.execute();
  }
}

@Injectable()
export class TestAiConnectionUseCase {
  constructor(
    private readonly runtime: AiRuntimeConfigService,
    @Inject(AI_CONNECTION_CHECKER) private readonly checker: IAiConnectionChecker,
    @Inject(AI_USAGE_REPO) private readonly usage: IAiUsageRepository,
  ) {}

  /** Prueba la clave enviada o, si no se envía, la que está en uso. No consume tokens. */
  async execute(candidate?: { apiKey?: string; model?: string }): Promise<AiConnectionCheck> {
    this.runtime.invalidate();
    const effective = await this.runtime.resolve();

    const apiKey = candidate?.apiKey?.trim() || effective.apiKey;
    const model = candidate?.model?.trim() || effective.model;

    if (!apiKey) {
      return { ok: false, status: null, latencyMs: 0, message: 'No hay una clave de OpenAI configurada.' };
    }
    if (candidate?.apiKey?.trim() && !KEY_PATTERN.test(apiKey)) {
      throw new BadRequestException('La clave no tiene el formato de una clave de OpenAI (empieza con "sk-").');
    }
    if (!MODEL_PATTERN.test(model)) {
      throw new BadRequestException('El nombre del modelo no es válido.');
    }

    const result = await this.checker.check(apiKey, model);

    await this.usage.add({
      model,
      kind: 'test',
      success: result.ok,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      durationMs: result.latencyMs,
      error: result.ok ? null : result.message.slice(0, 300),
    });

    return result;
  }
}

@Injectable()
export class GetAiUsageUseCase {
  constructor(@Inject(AI_USAGE_REPO) private readonly usage: IAiUsageRepository) {}

  execute(daysParam?: string): Promise<AiUsageSummary> {
    const parsed = Number.parseInt(daysParam ?? '30', 10);
    const days = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 365) : 30;
    return this.usage.summarize(days, 15);
  }
}