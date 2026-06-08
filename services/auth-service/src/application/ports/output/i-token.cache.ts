export interface ITokenCache {
  setRefreshToken(userId: string, token: string, ttlSeconds: number): Promise<void>;
  getRefreshToken(userId: string): Promise<string | null>;
  deleteRefreshToken(userId: string): Promise<void>;
  setResetToken(tokenHash: string, userId: string, ttlSeconds: number): Promise<void>;
  getResetToken(tokenHash: string): Promise<string | null>;
  deleteResetToken(tokenHash: string): Promise<void>;
  incrementLoginAttempts(ip: string, ttlSeconds: number): Promise<number>;
  deleteLoginAttempts(ip: string): Promise<void>;
}
