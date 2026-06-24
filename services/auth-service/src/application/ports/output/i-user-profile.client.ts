export interface IUserProfileClient {
  createProfile(userId: string): Promise<void>;
}
