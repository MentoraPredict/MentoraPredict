export interface IAuthSyncClient {
  syncRole(userId: string, role: string): Promise<void>;
  syncStatus(userId: string, status: string): Promise<void>;
}
