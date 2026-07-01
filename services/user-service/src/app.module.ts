import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { HttpModule } from "@nestjs/axios";

import { UsersController } from "./infrastructure/controllers/users.controller";
import { InternalUsersController } from "./infrastructure/controllers/internal-users.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";
import { UserProfileOrmEntity } from "./infrastructure/persistence/user-profile.orm-entity";
import { UserProfileRepository } from "./infrastructure/persistence/user-profile.repository";
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case";
import { SoftDeleteUserUseCase } from "./application/use-cases/soft-delete-user.use-case";
import { ListUsersUseCase } from "./application/use-cases/list-users.use-case";
import { CreateUserProfileUseCase } from "./application/use-cases/create-user-profile.use-case";
import { decodeJwtKey } from "./infrastructure/config/jwt-key.util";
import { InternalServiceGuard } from "./infrastructure/guards/internal-service.guard";
import { RolesGuard } from "./infrastructure/guards/roles.guard";
import { AuthHttpClient } from "./infrastructure/adapters/auth-http.client";
import { AuthSyncClient } from "./infrastructure/adapters/auth-sync.client";
import { GetUserUseCase } from "./application/use-cases/get-user.use-case";
import { InternalJwtService } from "./infrastructure/auth/internal-jwt.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: "postgres",
        host: cfg.get("POSTGRES_HOST", "localhost"),
        port: cfg.get<number>("POSTGRES_PORT", 5432),
        username: cfg.get("POSTGRES_USER", "mp_user"),
        password: cfg.get("POSTGRES_PASSWORD", ""),
        database: cfg.get("POSTGRES_DB", "mentorapredict"),
        entities: [UserProfileOrmEntity],
        synchronize: cfg.get("NODE_ENV") !== "production",
        logging: cfg.get("NODE_ENV") === "development",
      }),
    }),
    TypeOrmModule.forFeature([UserProfileOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const publicKey = decodeJwtKey(
          cfg.get<string>("JWT_PUBLIC_KEY") ||
            cfg.get<string>("JWT_PUBLIC_KEY_PATH"),
        );
        const privateKey = decodeJwtKey(
          cfg.get<string>("JWT_PRIVATE_KEY") ||
            cfg.get<string>("JWT_PRIVATE_KEY_PATH"),
        );
        if (publicKey) {
          return {
            ...(privateKey ? { privateKey } : {}),
            publicKey,
            signOptions: { algorithm: "RS256", issuer: "mentorapredict" },
          };
        }
        return { secret: cfg.get("JWT_SECRET", "dev-secret-change-in-prod") };
      },
    }),
  ],
  controllers: [
    UsersController,
    InternalUsersController,
    HealthController,
    RootController,
  ],
  providers: [
    { provide: "IUserProfileRepository", useClass: UserProfileRepository },
    { provide: "IAuthServiceClient", useClass: AuthHttpClient },
    { provide: "IAuthSyncClient", useClass: AuthSyncClient },
    GetUserUseCase,
    UpdateUserUseCase,
    SoftDeleteUserUseCase,
    ListUsersUseCase,
    CreateUserProfileUseCase,
    InternalJwtService,
    InternalServiceGuard,
    RolesGuard,
  ],
})
export class AppModule {}
