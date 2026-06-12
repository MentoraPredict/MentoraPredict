import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuthProvider, UserProfileEntity, UserProfileStatus,
} from '../../domain/entities/user-profile.entity';
import {
  IUserProfileRepository, UserProfileFilters,
} from '../../domain/ports/i-user-profile.repository';
import { UserProfileOrmEntity } from './user-profile.orm-entity';

@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
  constructor(
    @InjectRepository(UserProfileOrmEntity)
    private readonly repo: Repository<UserProfileOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserProfileEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async update(id: string, data: Partial<UserProfileEntity>): Promise<UserProfileEntity> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) throw new Error('User not found');

    if (data.photo !== undefined) orm.photo = data.photo;
    if (data.bio !== undefined) orm.bio = data.bio;
    if (data.cedula !== undefined) orm.cedula = data.cedula;
    if (data.authProvider !== undefined) orm.authProvider = data.authProvider;
    if (data.role !== undefined) orm.role = data.role;
    if (data.status !== undefined) orm.status = data.status;

    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
    await this.repo.update(id, { status: 'INACTIVE' });
  }

  async findAll(filters: UserProfileFilters): Promise<UserProfileEntity[]> {
    const qb = this.repo.createQueryBuilder('u');
    if (filters.role) qb.andWhere('u.role = :role', { role: filters.role });
    if (filters.status) qb.andWhere('u.status = :status', { status: filters.status });
    const list = await qb.getMany();
    return list.map((o) => this.toDomain(o));
  }

  private toDomain(orm: UserProfileOrmEntity): UserProfileEntity {
    return new UserProfileEntity(
      orm.id,
      orm.photo,
      orm.bio,
      orm.cedula,
      orm.authProvider as AuthProvider,
      orm.role,
      orm.status as UserProfileStatus,
      orm.deletedAt,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
