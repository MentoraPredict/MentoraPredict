import { Injectable, NotFoundException, Logger, Inject } from "@nestjs/common";
import { IUserRepository } from "../ports/output/i-user.repository";
import { IUserProfileClient } from "../ports/output/i-user-profile.client";
import { UpdateUserDto } from "../dtos/update-user.dto";

@Injectable()
export class UpdateAuthUserUseCase {
  private readonly logger = new Logger(UpdateAuthUserUseCase.name);

  constructor(
    private readonly repo: IUserRepository,

    @Inject("IUserProfileClient")
    private readonly userProfileClient: IUserProfileClient,
  ) {}

  async execute(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException("User not found");

    if (dto.email) user.email = dto.email;
    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;

    user.updatedAt = new Date();

    const updated = await this.repo.update(user);

    this.userProfileClient
      .updateProfile(id, {
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
      })
      .catch((err) => {
        this.logger.error(
          `Failed to sync profile update for user ${id}: ${err.message}`,
        );
      });

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      role: updated.role,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt,
    };
  }
}
