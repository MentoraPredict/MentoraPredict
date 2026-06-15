import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/ports/i-user-profile.repository';

@Injectable()
export class SoftDeleteUserUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('User not found');
    await this.repo.softDelete(id);
  }
}
