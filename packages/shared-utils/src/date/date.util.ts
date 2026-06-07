/** Pure date helpers — no side effects */
export function toISOString(date: Date): string {
  return date.toISOString();
}

export function isExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}
