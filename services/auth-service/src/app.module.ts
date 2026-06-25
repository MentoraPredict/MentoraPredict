import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./infrastructure/controllers/auth.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";

import { UserOrmEntity } from "./infrastructure/persistence/user.orm-entity";
import { UserRepository } from "./infrastructure/persistence/user.repository";
import { RedisClient } from "./infrastructure/cache/redis.client";
import { RedisAdapter } from "./infrastructure/cache/redis.adapter";
import { JwtAdapter } from "./infrastructure/config/jwt.adapter";
import { BcryptAdapter } from "./infrastructure/config/bcrypt.adapter";
import { decodeJwtKey } from "./infrastructure/config/jwt-key.util";
import { InternalJwtService } from "./infrastructure/auth/internal-jwt.service";
import { UserProfileHttpClient } from "./infrastructure/adapters/user-profile-http.client";

import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "./application/use-cases/login-user.use-case";
import { LogoutUserUseCase } from "./application/use-cases/logout-user.use-case";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case";
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";
import { EmailAdapter } from "./infrastructure/adapters/email.adapter";
import { InternalUsersController } from "./infrastructure/controllers/internal-auth.controller";
import { GetAuthUserUseCase } from "./application/use-cases/get-auth-user.use-case";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: "postgres",
        host: cfg.get("POSTGRES_HOST", "localhost"),
        port: cfg.get<number>("POSTGRES_PORT", 5432),
        username: cfg.get("POSTGRES_USER", "mp_user"),
        password: cfg.get("POSTGRES_PASSWORD", ""),
        database: cfg.get("POSTGRES_DB", "mentorapredict"),
        entities: [UserOrmEntity],
        synchronize: cfg.get("NODE_ENV") !== "production",
        logging: cfg.get("NODE_ENV") === "development",
      }),
    }),

    TypeOrmModule.forFeature([UserOrmEntity]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const privateKey = decodeJwtKey(
          cfg.get<string>("JWT_PRIVATE_KEY") ||
            cfg.get<string>("JWT_PRIVATE_KEY_PATH"),
        );
        const publicKey = decodeJwtKey(
          cfg.get<string>("JWT_PUBLIC_KEY") ||
            cfg.get<string>("JWT_PUBLIC_KEY_PATH"),
        );

        // RS256 when asymmetric keys are provided (recommended for production).
        // Falls back to HS256 with JWT_SECRET for local development.
        if (privateKey && publicKey) {
          return {
            privateKey,
            publicKey,
            signOptions: {
              algorithm: "RS256",
              issuer: "mentorapredict",
            },
          };
        }
        return {
          secret: cfg.get("JWT_SECRET", "dev-secret-change-in-prod"),
          signOptions: {
            issuer: "mentorapredict",
          },
        };
      },
    }),
  ],
  controllers: [
    AuthController,
    HealthController,
    RootController,
    InternalUsersController,
  ],
  providers: [
    // Infrastructure adapters registered as interface tokens
    RedisClient,
    RedisAdapter,
    { provide: "ITokenCache", useExisting: RedisAdapter },
    { provide: "ICachePort", useExisting: RedisAdapter },
    { provide: "IEmailPort", useClass: EmailAdapter },
    { provide: "IPasswordHasher", useClass: BcryptAdapter },
    { provide: "ITokenGenerator", useClass: JwtAdapter },
    { provide: "IUserRepository", useClass: UserRepository },
    InternalJwtService,
    { provide: "IUserProfileClient", useClass: UserProfileHttpClient },
    // Use-cases
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GetAuthUserUseCase,
  ],
})
export class AppModule {}
