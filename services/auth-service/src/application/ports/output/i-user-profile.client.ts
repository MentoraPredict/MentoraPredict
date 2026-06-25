export interface IUserProfileClient {
  createProfile(userId: string): Promise<void>;

  updateProfile(
    userId: string,
    dto: {
      email?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<void>;
}
