export interface ICachePort {
  setResetToken(token: string, userId: string, ttlSeconds: number): Promise<void>;
  getResetToken(token: string): Promise<string | null>;
  deleteResetToken(token: string): Promise<void>;
}
