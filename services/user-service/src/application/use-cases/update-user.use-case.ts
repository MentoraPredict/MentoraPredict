import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/ports/i-user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserProfileEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('User not found');
    return this.repo.update(id, dto);
  }
}
