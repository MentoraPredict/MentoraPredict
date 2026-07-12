import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository } from "../ports/output/i-user.repository";

@Injectable()
export class GetAuthUsersByIdsUseCase {
  constructor(
    @Inject("IUserRepository")
    private readonly repo: IUserRepository,
  ) {}

  async execute(ids: string[]) {
    const users = await this.repo.findByIds(ids);

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    }));
  }
}
