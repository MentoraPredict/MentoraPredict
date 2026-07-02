import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../ports/output/i-user.repository';
import { UserRole } from '../../domain/entities/user.entity';

export interface SyncAuthUserDto {
  role?: string;
  status?: string;
}

@Injectable()
export class SyncAuthUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly repo: IUserRepository,
  ) {}

  async execute(userId: string, dto: SyncAuthUserDto): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (dto.role) {
      user.changeRole(dto.role as UserRole);
    }
    if (dto.status === 'ACTIVE') {
      user.activate();
    } else if (dto.status === 'INACTIVE') {
      user.deactivate();
    }

    await this.repo.update(user);
  }
}
