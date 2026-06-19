import { Inject, Injectable } from '@nestjs/common';
import { IUserProfileRepository, UserProfileFilters } from '../../domain/ports/i-user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
  ) {}

  async execute(filters: UserProfileFilters): Promise<UserProfileEntity[]> {
    return this.repo.findAll(filters);
  }
}
