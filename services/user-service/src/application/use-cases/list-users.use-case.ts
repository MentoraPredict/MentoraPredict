import { Inject, Injectable } from "@nestjs/common";
import {
  IUserProfileRepository,
  UserProfileFilters,
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

    return Promise.all(
      profiles.map(async (profile) => {
        const authUser = await this.authClient.getUserById(profile.id);

        return GetUserMapper.toResponse(profile, authUser);
      }),
    );
  }
}
