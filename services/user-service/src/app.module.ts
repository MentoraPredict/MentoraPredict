import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { existsSync, readFileSync } from 'node:fs';

import { UsersController } from "./infrastructure/controllers/users.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";
import { UserProfileOrmEntity } from "./infrastructure/persistence/user-profile.orm-entity";
import { UserProfileRepository } from "./infrastructure/persistence/user-profile.repository";
import { GetUserUseCase } from "./application/use-cases/get-user.use-case";
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case";
import { SoftDeleteUserUseCase } from "./application/use-cases/soft-delete-user.use-case";
import { ListUsersUseCase } from "./application/use-cases/list-users.use-case";
import { JwtAuthGuard } from "./infrastructure/guards/jwt-auth.guard";

function decodeJwtKey(key: string | undefined): string | undefined {
  if (!key?.trim()) return undefined;
  if (key.includes('BEGIN')) return key;
  if (existsSync(key)) return readFileSync(key, 'utf-8');
  try {
    return Buffer.from(key, 'base64').toString('utf-8');
  } catch {
    return key;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const publicKey = decodeJwtKey(cfg.get<string>('JWT_PUBLIC_KEY') || cfg.get<string>('JWT_PUBLIC_KEY_PATH'));
        if (publicKey) {
          return {
            publicKey,
            signOptions: { algorithm: "RS256", issuer: "mentorapredict" },
          };
        }
        return {
          secret: cfg.get<string>('JWT_SECRET') || 'dev-secret',
        };
      },
    }),
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
  ],
  controllers: [UsersController, HealthController, RootController],
  providers: [
    { provide: "IUserProfileRepository", useClass: UserProfileRepository },
    GetUserUseCase,
    UpdateUserUseCase,
    SoftDeleteUserUseCase,
    ListUsersUseCase,
    JwtAuthGuard,
  ],
})
export class AppModule {}
