import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IUserRepository } from "../ports/output/i-user.repository";

@Injectable()
export class GetAuthUserUseCase {
  constructor(
    @Inject("IUserRepository")
    private readonly repo: IUserRepository,
  ) {}

  async execute(id: string) {
    const user = await this.repo.findById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    };
  }
}
