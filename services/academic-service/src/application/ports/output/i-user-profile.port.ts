export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export interface IUserProfilePort {
  getProfile(userId: string): Promise<UserProfileData | null>;
}
