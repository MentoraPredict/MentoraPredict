export interface UserProfileData {
  id: string;
  role: string;
  status: string;
}

export interface IUserServiceClient {
  getProfile(userId: string): Promise<UserProfileData | null>;
}
