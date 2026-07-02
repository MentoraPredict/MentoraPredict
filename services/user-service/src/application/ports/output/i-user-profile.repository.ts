import { UserProfileEntity } from "../../../domain/entities/user-profile.entity";

export interface IUserProfileRepository {
  findById(id: string): Promise<UserProfileEntity | null>;
  update(
    id: string,
    data: Partial<UserProfileEntity>,
  ): Promise<UserProfileEntity>;
  softDelete(id: string): Promise<void>;
}
