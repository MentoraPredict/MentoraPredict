import { UserProfileEntity } from "../entities/user-profile.entity";

export interface UserProfileFilters {
  role?: string;
  status?: string;
  ids?: string[];
}

export interface UserProfilePagination {
  page: number;
  limit: number;
}

export interface PaginatedUserProfiles {
  items: UserProfileEntity[];
  total: number;
}

export interface IUserProfileRepository {
  create(profile: {
    id: string;
    role: string;
    cedula?: string | null;
  }): Promise<UserProfileEntity>;
  findById(id: string): Promise<UserProfileEntity | null>;
  update(
    id: string,
    data: Partial<UserProfileEntity>,
  ): Promise<UserProfileEntity>;
  softDelete(id: string): Promise<void>;
  findAll(filters: UserProfileFilters): Promise<UserProfileEntity[]>;
  findPaginated(
    filters: UserProfileFilters,
    pagination: UserProfilePagination,
  ): Promise<PaginatedUserProfiles>;
}
