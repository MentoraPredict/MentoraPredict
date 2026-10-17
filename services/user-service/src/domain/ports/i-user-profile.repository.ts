import { UserProfileEntity } from "../entities/user-profile.entity";

export interface UserProfileFilters {
  role?: string;
  status?: string;
  ids?: string[];
}

/** Campo por el que se agrupa (ordena) el listado para mostrarlo en bloques. */
export type UserProfileGroupBy = "role" | "status";

export interface UserProfilePagination {
  page: number;
  limit: number;
  groupBy?: UserProfileGroupBy;
}

export interface PaginatedUserProfiles {
  items: UserProfileEntity[];
  total: number;
}

export interface UserProfileGroupCount {
  key: string;
  count: number;
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
  /** Cantidad de perfiles por valor del campo de agrupación, con los mismos filtros. */
  countByGroup(
    filters: UserProfileFilters,
    groupBy: UserProfileGroupBy,
  ): Promise<UserProfileGroupCount[]>;
}
