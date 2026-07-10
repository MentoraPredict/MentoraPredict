export interface IUserServiceClient {
  getUserIdsByRole(role: string): Promise<string[]>;
}
