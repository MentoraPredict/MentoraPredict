import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      orm.firstName, orm.lastName,
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
    orm.createdAt    = domain.createdAt;
    orm.updatedAt    = domain.updatedAt;
    return orm;
  }
}
