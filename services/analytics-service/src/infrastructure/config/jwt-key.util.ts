import { existsSync, readFileSync } from 'node:fs';

export function decodeJwtKey(key: string | undefined): string | undefined {
  if (!key?.trim()) return undefined;
  if (key.includes('BEGIN')) return key;
  if (key && existsSync(key)) return readFileSync(key, 'utf-8');
  try {
    return Buffer.from(key || '', 'base64').toString('utf-8');
  } catch {
    return key;
  }
}
