import { Inject, Injectable } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/ports/i-user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { CreateUserProfileDto } from '../dtos/create-user-profile.dto';

@Injectable()
export class CreateUserProfileUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
  ) {}

  async execute(dto: CreateUserProfileDto): Promise<UserProfileEntity> {
    return this.repo.create({
      id: dto.userId,
      role: 'STUDENT',
      cedula: dto.cedula ?? null,
    });
  }
}
