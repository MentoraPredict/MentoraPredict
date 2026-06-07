import { ConflictException, Inject } from '@nestjs/common';
import { randomUUID as uuidv4 } from 'crypto';
import { UserEntity, UserRole } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { IUserRepository } from '../ports/output/i-user.repository';
import { IPasswordHasher } from '../ports/output/i-password.hasher';
import { RegisterDto } from '../dtos';
import { IRegisterUseCase } from '../ports/input/i-auth.use-cases';

export const USER_REPO  = 'IUserRepository';
export const PWD_HASHER = 'IPasswordHasher';

export class RegisterUserUseCase implements IRegisterUseCase {
  constructor(
    @Inject(USER_REPO)  private readonly userRepo: IUserRepository,
    @Inject(PWD_HASHER) private readonly hasher: IPasswordHasher,
  ) {}

  async execute(dto: RegisterDto) {
    const email    = Email.create(dto.email);
    const password = Password.create(dto.password);

    const existing = await this.userRepo.findByEmail(email.value);
    if (existing) throw new ConflictException('Email already registered');

    const hash = await this.hasher.hash(password.raw);
    const now  = new Date();
    const user = new UserEntity(
      uuidv4(), email.value, hash,
      UserRole.STUDENT, true, false, now, now,
      dto.firstName, dto.lastName,
    );

    const saved = await this.userRepo.save(user);
    return {
      id:        saved.id,
      email:     saved.email,
      firstName: saved.firstName,
      lastName:  saved.lastName,
      role:      saved.role,
      createdAt: saved.createdAt,
    };
  }
}
