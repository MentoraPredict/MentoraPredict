export interface IAuthServiceClient {
  getUserById(userId: string): Promise<AuthUserResponse>;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}
