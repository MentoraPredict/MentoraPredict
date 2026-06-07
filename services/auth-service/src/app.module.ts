import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './infrastructure/controllers/auth.controller';
import { HealthController } from './infrastructure/controllers/health.controller';

import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { RedisClient } from './infrastructure/cache/redis.client';
import { RedisAdapter } from './infrastructure/cache/redis.adapter';
import { JwtAdapter } from './infrastructure/config/jwt.adapter';
import { BcryptAdapter } from './infrastructure/config/bcrypt.adapter';

import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host:     cfg.get('POSTGRES_HOST', 'localhost'),
        port:     cfg.get<number>('POSTGRES_PORT', 5432),
        username: cfg.get('POSTGRES_USER', 'mp_user'),
        password: cfg.get('POSTGRES_PASSWORD', ''),
        database: cfg.get('POSTGRES_DB', 'mentorapredict'),
        entities:    [UserOrmEntity],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging:     cfg.get('NODE_ENV') === 'development',
      }),
    }),

    TypeOrmModule.forFeature([UserOrmEntity]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const privateKey = cfg.get<string>('JWT_PRIVATE_KEY');
        const publicKey  = cfg.get<string>('JWT_PUBLIC_KEY');

        // RS256 when asymmetric keys are provided (recommended for production).
        // Falls back to HS256 with JWT_SECRET for local development.
        if (privateKey && publicKey) {
          return {
            privateKey,
            publicKey,
            signOptions: { algorithm: 'RS256', issuer: 'mentorapredict', audience: 'mentorapredict-api' },
          };
        }
        return {
          secret:      cfg.get('JWT_SECRET', 'dev-secret-change-in-prod'),
          signOptions: { issuer: 'mentorapredict', audience: 'mentorapredict-api' },
        };
      },
    }),
  ],
  controllers: [AuthController, HealthController],
  providers: [
    // Infrastructure adapters registered as interface tokens
    RedisClient,
    { provide: 'ITokenCache',     useClass: RedisAdapter },
    { provide: 'IPasswordHasher', useClass: BcryptAdapter },
    { provide: 'ITokenGenerator', useClass: JwtAdapter },
    { provide: 'IUserRepository', useClass: UserRepository },
    // Use-cases
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase,
  ],
})
export class AppModule {}
