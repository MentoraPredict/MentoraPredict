import { existsSync, readFileSync } from 'node:fs';

/**
 * Decodes JWT keys stored as base64-encoded PEM in environment variables.
 * Accepts raw PEM strings for local development convenience, or file paths.
 */
export function decodeJwtKey(key: string | undefined): string | undefined {
  if (!key?.trim()) return undefined;
  if (key.includes('BEGIN')) return key;
  if (existsSync(key)) return readFileSync(key, 'utf-8');
  try {
    return Buffer.from(key, 'base64').toString('utf-8');
  } catch {
    return key;
  }
}
