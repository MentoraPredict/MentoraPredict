import { UserProfileEntity } from '../entities/user-profile.entity';

export interface UserProfileFilters {
  role?: string;
  status?: string;
}

export interface IUserProfileRepository {
  findById(id: string): Promise<UserProfileEntity | null>;
  update(id: string, data: Partial<UserProfileEntity>): Promise<UserProfileEntity>;
  softDelete(id: string): Promise<void>;
  findAll(filters: UserProfileFilters): Promise<UserProfileEntity[]>;
}
