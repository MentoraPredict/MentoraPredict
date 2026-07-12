import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../ports/output/i-user.repository';

@Injectable()
export class SearchAuthUsersUseCase {
  constructor(
    @Inject('IUserRepository') private readonly repo: IUserRepository,
  ) {}

  async execute(search: string, limit = 200) {
    const users = await this.repo.searchByText(search, limit);

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    }));
  }
}
