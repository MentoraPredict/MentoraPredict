/**
 * RNF-042: Strip PII fields before sending data to prediction/analytics.
 * These helpers remove fields from objects.
 * The DECISION of what counts as PII stays in each service's use-case layer.
 */
export function stripPiiFields<T extends Record<string, unknown>>(
  obj: T,
  piiFields: (keyof T)[],
): Omit<T, keyof T> {
  const result = { ...obj };
  for (const field of piiFields) {
    delete result[field as string];
  }
  return result;
}

/** Standard PII fields to strip before any ML inference call */
export const STANDARD_PII_FIELDS = [
  'email',
  'firstName',
  'lastName',
  'phone',
  'avatarUrl',
  'passwordHash',
] as const;
