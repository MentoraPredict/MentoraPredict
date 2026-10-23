export interface AiSettingsRecord {
  encryptedApiKey: string | null;
  keyLast4: string | null;
  model: string | null;
  enabled: boolean;
  updatedBy: string | null;
  updatedAt: Date | null;
}

export type AiSettingsPatch = Partial<Omit<AiSettingsRecord, 'updatedAt'>>;

export interface IAiSettingsRepository {
  /** Siempre devuelve un registro: si nunca se configuró, con los valores por defecto. */
  get(): Promise<AiSettingsRecord>;
  save(patch: AiSettingsPatch): Promise<AiSettingsRecord>;
}