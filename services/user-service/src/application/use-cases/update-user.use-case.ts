import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/ports/i-user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { IAuthSyncClient } from '../ports/output/i-auth-sync.client';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
    @Inject('IAuthSyncClient') private readonly authSync: IAuthSyncClient,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserProfileEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    const updated = await this.repo.update(id, dto);

    if (dto.role !== undefined) {
      this.authSync.syncRole(id, dto.role).catch((err) =>
        this.logger.error(`Failed to sync role for user ${id} to auth-service`, err),
      );
    }
    if (dto.status !== undefined) {
      this.authSync.syncStatus(id, dto.status).catch((err) =>
        this.logger.error(`Failed to sync status for user ${id} to auth-service`, err),
      );
    }

    return updated;
  }
}
