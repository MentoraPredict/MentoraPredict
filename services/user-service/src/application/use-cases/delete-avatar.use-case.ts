import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/ports/i-user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { IImageStoragePort } from '../ports/output/i-image-storage.port';

@Injectable()
export class DeleteAvatarUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
    @Inject('IImageStoragePort') private readonly imageStorage: IImageStoragePort,
  ) {}

  async execute(userId: string): Promise<UserProfileEntity> {
    const existing = await this.repo.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    if (!existing.avatarUrl) return existing;

    await this.imageStorage.deleteByPublicUrl(existing.avatarUrl);
    return this.repo.update(userId, { avatarUrl: null });
  }
}
