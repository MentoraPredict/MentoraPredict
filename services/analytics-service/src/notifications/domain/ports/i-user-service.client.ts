export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export interface IUserServiceClient {
  getUserIdsByRole(role: string): Promise<string[]>;
  getProfile(userId: string): Promise<UserProfileData | null>;
}
