import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AesSecretCipher } from '../../../infrastructure/adapters/aes-secret-cipher';
import { AiRuntimeConfigService } from '../../services/ai-runtime-config.service';
import {
  GetAiSettingsUseCase,
  TestAiConnectionUseCase,
  UpdateAiSettingsUseCase,
} from '../ai-settings.use-cases';

const VALID_KEY = 'sk-test_1234567890abcdefWXYZ';

function setup(env: Record<string, string> = {}) {
  let record = {
    encryptedApiKey: null as string | null,
    keyLast4: null as string | null,
    model: null as string | null,
    enabled: true,
    updatedBy: null as string | null,
    updatedAt: null as Date | null,
  };
  const settings = {
    get: jest.fn(async () => ({ ...record })),
    save: jest.fn(async (patch: Partial<typeof record>) => {
      record = { ...record, ...patch, updatedAt: new Date() };
      return { ...record };
    }),
  };
  const usage = { add: jest.fn(), summarize: jest.fn() };
  const checker = { check: jest.fn() };
  const config = { get: (key: string, fallback?: string) => env[key] ?? fallback } as unknown as ConfigService;
  const cipher = new AesSecretCipher(config);
  const runtime = new AiRuntimeConfigService(settings, cipher, config);
  const getSettings = new GetAiSettingsUseCase(settings, runtime);
  const update = new UpdateAiSettingsUseCase(settings, cipher, runtime, getSettings);
  const test = new TestAiConnectionUseCase(runtime, checker, usage);

  return { settings, usage, checker, cipher, runtime, getSettings, update, test, record: () => record };
}

describe('AI settings', () => {
  it('cifra y descifra la clave sin alterarla', () => {
    const { cipher } = setup({ AI_SETTINGS_ENCRYPTION_KEY: 'secreto-de-prueba' });
    const encrypted = cipher.encrypt(VALID_KEY);

    expect(encrypted).not.toContain(VALID_KEY);
    expect(cipher.decrypt(encrypted)).toBe(VALID_KEY);
  });

  it('guarda la clave cifrada y solo expone los últimos 4 caracteres', async () => {
    const { update, record } = setup();
    const view = await update.execute({ apiKey: VALID_KEY }, 'admin-1');

    expect(record().encryptedApiKey).toBeTruthy();
    expect(record().encryptedApiKey).not.toContain(VALID_KEY);
    expect(view).toMatchObject({ configured: true, source: 'database', keyLast4: 'WXYZ' });
    expect(JSON.stringify(view)).not.toContain(VALID_KEY);
  });

  it('rechaza una clave con formato inválido', async () => {
    const { update } = setup();
    await expect(update.execute({ apiKey: 'no-es-una-clave' }, 'admin-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('usa la variable de entorno cuando no hay clave guardada', async () => {
    const { getSettings } = setup({ OPENAI_API_KEY: VALID_KEY });
    expect(await getSettings.execute()).toMatchObject({ configured: true, source: 'environment' });
  });

  it('borrar la clave guardada vuelve al entorno o a «sin configurar»', async () => {
    const { update } = setup();
    await update.execute({ apiKey: VALID_KEY }, 'admin-1');
    const view = await update.execute({ clearApiKey: true }, 'admin-1');

    expect(view).toMatchObject({ configured: false, source: 'none', keyLast4: null });
  });

  it('la prueba de conexión registra el intento y no cuenta tokens', async () => {
    const { test, checker, usage } = setup();
    checker.check.mockResolvedValue({ ok: true, status: 200, latencyMs: 120, message: 'ok' });

    const result = await test.execute({ apiKey: VALID_KEY, model: 'gpt-4o-mini' });

    expect(result.ok).toBe(true);
    expect(checker.check).toHaveBeenCalledWith(VALID_KEY, 'gpt-4o-mini');
    expect(usage.add).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'test', success: true, totalTokens: 0 }),
    );
  });

  it('sin clave configurada la prueba no llama al proveedor', async () => {
    const { test, checker } = setup();
    const result = await test.execute();

    expect(result.ok).toBe(false);
    expect(checker.check).not.toHaveBeenCalled();
  });
});