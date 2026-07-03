import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/ports/i-user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { MulterMemoryFile, deletePhysicalFileByPublicUrl, saveImageToDisk, validateImage } from '../../infrastructure/storage/upload.util';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
  ) {}

  async execute(userId: string, file: MulterMemoryFile | undefined): Promise<UserProfileEntity> {
    const existing = await this.repo.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    validateImage(file);

    // Delete the old physical file first — never accumulate orphans.
    if (existing.avatarUrl) {
      deletePhysicalFileByPublicUrl(existing.avatarUrl);
    }

    const { publicUrl } = saveImageToDisk('avatars', file as MulterMemoryFile);
    return this.repo.update(userId, { avatarUrl: publicUrl });
  }
}
