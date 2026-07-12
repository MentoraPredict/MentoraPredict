import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity, UserRole } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../application/ports/output/i-user.repository';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByIds(ids: string[]): Promise<UserEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const orms = await this.repo.find({ where: { id: In(ids) } });
    return orms.map((orm) => this.toDomain(orm));
  }

  async searchByText(search: string, limit = 200): Promise<UserEntity[]> {
    const term = search.trim();
    if (!term) {
      return [];
    }

    const orms = await this.repo
      .createQueryBuilder('u')
      .where('LOWER(u.email) LIKE LOWER(:search)', { search: `%${term}%` })
      .orWhere('LOWER(u.firstName) LIKE LOWER(:search)', { search: `%${term}%` })
      .orWhere('LOWER(u.lastName) LIKE LOWER(:search)', { search: `%${term}%` })
      .orderBy('u.createdAt', 'DESC')
      .take(Math.min(Math.max(1, limit), 500))
      .getMany();

    return orms.map((orm) => this.toDomain(orm));
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOne({ where: { email } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const orm   = this.toOrm(user);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    await this.repo.save(this.toOrm(user));
    return user;
  }

  // ── Mappers ──────────────────────────────────────────
  private toDomain(orm: UserOrmEntity): UserEntity {
    return new UserEntity(
      orm.id, orm.email, orm.passwordHash,
      orm.role as UserRole, orm.isActive, orm.isVerified,
      orm.createdAt, orm.updatedAt,
      orm.firstName, orm.lastName, orm.authProvider,
    );
  }

  private toOrm(domain: UserEntity): UserOrmEntity {
    const orm        = new UserOrmEntity();
    orm.id           = domain.id;
    orm.email        = domain.email;
    orm.passwordHash = domain.passwordHash;
    orm.role         = domain.role;
    orm.isActive     = domain.isActive;
    orm.isVerified   = domain.isVerified;
    orm.firstName    = domain.firstName;
    orm.lastName     = domain.lastName;
    orm.authProvider = domain.authProvider;
    orm.createdAt    = domain.createdAt;
    orm.updatedAt    = domain.updatedAt;
    return orm;
  }
}
