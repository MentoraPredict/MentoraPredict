import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UsersController } from "./infrastructure/controllers/users.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";
import { UserProfileOrmEntity } from "./infrastructure/persistence/user-profile.orm-entity";
import { UserProfileRepository } from "./infrastructure/persistence/user-profile.repository";
import { GetUserUseCase } from "./application/use-cases/get-user.use-case";
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case";
import { SoftDeleteUserUseCase } from "./application/use-cases/soft-delete-user.use-case";
import { ListUsersUseCase } from "./application/use-cases/list-users.use-case";

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
  ],
})
export class AppModule {}
