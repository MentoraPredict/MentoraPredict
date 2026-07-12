export interface IAuthServiceClient {
  getUserById(userId: string): Promise<AuthUserResponse | undefined>;
  getUsersByIds(userIds: string[]): Promise<AuthUserResponse[]>;
  searchUsers(search: string, limit?: number): Promise<AuthUserResponse[]>;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}
