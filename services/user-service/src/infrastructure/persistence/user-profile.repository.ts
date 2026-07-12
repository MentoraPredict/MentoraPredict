import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuthProvider, UserProfileEntity, UserProfileStatus,
} from '../../domain/entities/user-profile.entity';
import {
  IUserProfileRepository, UserProfileFilters, UserProfilePagination,
} from '../../domain/ports/i-user-profile.repository';
import { UserProfileOrmEntity } from './user-profile.orm-entity';

@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
  constructor(
    @InjectRepository(UserProfileOrmEntity)
    private readonly repo: Repository<UserProfileOrmEntity>,
  ) {}

  async create(profile: { id: string; role: string; cedula?: string | null }): Promise<UserProfileEntity> {
    const existing = await this.repo.findOne({ where: { id: profile.id } });
    if (existing) return this.toDomain(existing);

    const orm = this.repo.create({
      id: profile.id,
      role: profile.role,
      photo: null,
      bio: null,
      cedula: profile.cedula ?? null,
      avatarUrl: null,
      authProvider: 'LOCAL',
      status: 'ACTIVE',
    });
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

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
    if (data.avatarUrl !== undefined) orm.avatarUrl = data.avatarUrl;
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
    const qb = this.createFilteredQuery(filters);
    const list = await qb.getMany();
    return list.map((o) => this.toDomain(o));
  }

  async findPaginated(
    filters: UserProfileFilters,
    pagination: UserProfilePagination,
  ): Promise<{ items: UserProfileEntity[]; total: number }> {
    const page = Math.max(1, pagination.page);
    const limit = Math.min(Math.max(1, pagination.limit), 100);
    const qb = this.createFilteredQuery(filters)
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((o) => this.toDomain(o)),
      total,
    };
  }

  private createFilteredQuery(filters: UserProfileFilters) {
    const qb = this.repo.createQueryBuilder('u');
    if (filters.role) {
      qb.andWhere('LOWER(u.role) = LOWER(:role)', { role: filters.role });
    }
    if (filters.status) {
      qb.andWhere('LOWER(u.status) = LOWER(:status)', { status: filters.status });
    }
    if (filters.ids) {
      if (filters.ids.length === 0) {
        qb.andWhere('1 = 0');
      } else {
        qb.andWhere('u.id IN (:...ids)', { ids: filters.ids });
      }
    }
    return qb;
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
      orm.avatarUrl,
    );
  }
}
