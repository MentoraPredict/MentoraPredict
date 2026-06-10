export function decodeJwtKey(key: string | undefined): string | undefined {
  if (!key?.trim()) return undefined;
  if (key.includes('BEGIN')) return key;
  return Buffer.from(key, 'base64').toString('utf-8');
}
