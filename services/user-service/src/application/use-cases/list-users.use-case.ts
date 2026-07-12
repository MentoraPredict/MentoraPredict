import { Inject, Injectable } from "@nestjs/common";
import {
  IUserProfileRepository,
  UserProfileFilters,
  UserProfilePagination,
} from "../../domain/ports/i-user-profile.repository";
import { IAuthServiceClient } from "../ports/output/i-auth-service.client";
import { UserProfileResponseDto } from "../dtos/user-profile.response.dto";
import { GetUserMapper } from "./get-user.mapper";

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject("IUserProfileRepository")
    private readonly repo: IUserProfileRepository,

    @Inject("IAuthServiceClient")
    private readonly authClient: IAuthServiceClient,
  ) {}

  async execute(
    filters: UserProfileFilters,
  ): Promise<UserProfileResponseDto[]> {
    const profiles = await this.repo.findAll(filters);
    return this.enrichProfiles(profiles);
  }

  async executePaginated(
    filters: UserProfileFilters,
    pagination: UserProfilePagination,
    search?: string,
  ): Promise<{
    data: UserProfileResponseDto[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const page = Math.max(1, pagination.page);
    const limit = Math.min(Math.max(1, pagination.limit), 100);
    const filteredBySearch = await this.applySearchFilter(filters, search);
    const result = await this.repo.findPaginated(filteredBySearch, { page, limit });
    const data = await this.enrichProfiles(result.items);

    return {
      data,
      page,
      limit,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / limit)),
    };
  }

  private async applySearchFilter(
    filters: UserProfileFilters,
    search?: string,
  ): Promise<UserProfileFilters> {
    const normalizedSearch = search?.trim();
    if (!normalizedSearch) {
      return filters;
    }

    const authUsers = await this.authClient.searchUsers(normalizedSearch, 500);

    return {
      ...filters,
      ids: authUsers.map((user) => user.id),
    };
  }

  private async enrichProfiles(
    profiles: Awaited<ReturnType<IUserProfileRepository["findAll"]>>,
  ): Promise<UserProfileResponseDto[]> {
    // Batch lookup avoids one internal HTTP call per profile and keeps paged
    // dashboard loads responsive even when there are many users.
    const authUsers = await this.authClient.getUsersByIds(
      profiles.map((profile) => profile.id),
    );
    const authUsersById = new Map(
      authUsers.map((authUser) => [authUser.id, authUser]),
    );

    return profiles.map((profile) =>
      GetUserMapper.toResponse(profile, authUsersById.get(profile.id)),
    );
  }
}
