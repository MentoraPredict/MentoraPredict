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
    return this.executeWithOptions(id, dto);
  }

  async executeWithOptions(
    id: string,
    dto: UpdateUserDto,
    options: { skipAuthSync?: boolean } = {},
  ): Promise<UserProfileEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    const profilePatch: Partial<UserProfileEntity> = {
      photo: dto.photo,
      bio: dto.bio,
      cedula: dto.cedula,
      authProvider: dto.authProvider,
      role: dto.role,
      status: dto.status,
    };

    const updated = await this.repo.update(id, profilePatch);

    if (!options.skipAuthSync && (dto.email || dto.firstName || dto.lastName)) {
      await this.authSync.syncProfile(id, {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
    }

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
