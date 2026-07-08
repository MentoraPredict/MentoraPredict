export interface IAuthServiceClient {
  getUserById(userId: string): Promise<AuthUserResponse | undefined>;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}
