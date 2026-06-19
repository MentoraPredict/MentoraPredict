import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IUserRepository } from "../ports/output/i-user.repository";
import { ICachePort } from "../ports/output/i-cache.port";
import { IPasswordHasher } from "../ports/output/i-password.hasher";
import { ResetPasswordDto } from "../dtos/reset-password.dto";

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject("IUserRepository") private readonly userRepo: IUserRepository,
    @Inject("ICachePort") private readonly cache: ICachePort,
    @Inject("IPasswordHasher") private readonly hasher: IPasswordHasher,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const userId = await this.cache.getResetToken(dto.token);
    if (!userId) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      await this.cache.deleteResetToken(dto.token);
      throw new BadRequestException("Invalid or expired reset token");
    }

    const passwordHash = await this.hasher.hash(dto.newPassword);
    user.changePassword(passwordHash);
    await this.userRepo.update(user);
    await this.cache.deleteResetToken(dto.token);
  }
}
