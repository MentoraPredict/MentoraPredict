/**
 * Decodes JWT keys stored as base64-encoded PEM in environment variables.
 * Accepts raw PEM strings for local development convenience.
 */
export function decodeJwtKey(key: string | undefined): string | undefined {
  if (!key?.trim()) return undefined;
  if (key.includes('BEGIN')) return key;
  return Buffer.from(key, 'base64').toString('utf-8');
}
