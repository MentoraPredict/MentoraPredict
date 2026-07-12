import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/ports/i-user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { IImageStoragePort } from '../ports/output/i-image-storage.port';
import { MulterMemoryFile, validateImage } from '../../infrastructure/storage/upload.util';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
    @Inject('IImageStoragePort') private readonly imageStorage: IImageStoragePort,
  ) {}

  async execute(userId: string, file: MulterMemoryFile | undefined): Promise<UserProfileEntity> {
    const existing = await this.repo.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    validateImage(file);

    // Delete the old file first — never accumulate orphans.
    if (existing.avatarUrl) {
      await this.imageStorage.deleteByPublicUrl(existing.avatarUrl);
    }

    const { publicUrl } = await this.imageStorage.save('avatars', file as MulterMemoryFile);
    return this.repo.update(userId, { avatarUrl: publicUrl });
  }
}
