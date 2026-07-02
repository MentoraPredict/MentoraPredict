import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IUserProfileRepository } from "../../domain/ports/i-user-profile.repository";
import { IAuthServiceClient } from "../ports/output/i-auth-service.client";
import { UserProfileResponseDto } from "../dtos/user-profile.response.dto";
import { GetUserMapper } from "./get-user.mapper";

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject("IUserProfileRepository")
    private readonly repo: IUserProfileRepository,

    @Inject("IAuthServiceClient")
    private readonly authClient?: IAuthServiceClient,
  ) {}

  async execute(id: string): Promise<UserProfileResponseDto> {
    const profile = await this.repo.findById(id);
    if (!profile) throw new NotFoundException("User not found");

    if (!this.authClient) {
      return GetUserMapper.toResponse(profile);
    }

    const auth = await this.authClient.getUserById(id);

    return GetUserMapper.toResponse(profile, auth);
  }
}
