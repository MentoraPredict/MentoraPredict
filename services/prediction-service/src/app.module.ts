import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { createLoggerModule, correlationContextMiddleware } from "@mentorapredict/shared-logger";

import { PredictionController } from "./infrastructure/controllers/prediction.controller";
import { InternalPredictionController } from "./infrastructure/controllers/internal-prediction.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";

import { PredictionLogOrmEntity } from "./infrastructure/persistence/prediction-log.orm-entity";
import { PredictionLogRepository } from "./infrastructure/persistence/prediction-log.repository";
import { StudentSubjectPredictionOrmEntity } from "./infrastructure/persistence/student-subject-prediction.orm-entity";
import { StudentSubjectPredictionRepository } from "./infrastructure/persistence/student-subject-prediction.repository";
import { UserReferenceOrmEntity } from "./infrastructure/persistence/user-reference.orm-entity";
import { SubjectReferenceOrmEntity } from "./infrastructure/persistence/subject-reference.orm-entity";
import { PeriodReferenceOrmEntity } from "./infrastructure/persistence/period-reference.orm-entity";
import { AiSettingsOrmEntity } from "./infrastructure/persistence/ai-settings.orm-entity";
import { AiUsageOrmEntity } from "./infrastructure/persistence/ai-usage.orm-entity";
import { AiSettingsRepository } from "./infrastructure/persistence/ai-settings.repository";
import { AiUsageRepository } from "./infrastructure/persistence/ai-usage.repository";
import { AesSecretCipher } from "./infrastructure/adapters/aes-secret-cipher";
import { OpenAiConnectionChecker } from "./infrastructure/adapters/openai-connection.checker";
import { AiSettingsController } from "./infrastructure/controllers/ai-settings.controller";
import {
  AiRuntimeConfigService,
  AI_SETTINGS_REPO,
  SECRET_CIPHER,
} from "./application/services/ai-runtime-config.service";
import {
  AI_CONNECTION_CHECKER,
  AI_USAGE_REPO,
  GetAiSettingsUseCase,
  GetAiUsageUseCase,
  TestAiConnectionUseCase,
  UpdateAiSettingsUseCase,
} from "./application/use-cases/ai-settings.use-cases";
import { InternalJwtService } from "./infrastructure/auth/internal-jwt.service";
import { AnalyticsHttpClient } from "./infrastructure/adapters/analytics-http.client";
import { AcademicHttpClient } from "./infrastructure/adapters/academic-http.client";
import { UserHttpClient } from "./infrastructure/adapters/user-http.client";
import { OpenAiRecommendationProvider } from "./infrastructure/adapters/openai-recommendation.provider";
import { decodeJwtKey } from "./infrastructure/config/jwt-key.util";
import { RolesGuard } from "./infrastructure/guards/roles.guard";
import { InternalServiceGuard } from "./infrastructure/guards/internal-service.guard";

import {
  GeneratePredictionUseCase,
  ANALYTICS_CLIENT,
  ACADEMIC_CONTEXT_CLIENT,
  AI_PROVIDER,
  PREDICTION_LOG_REPO,
} from "./application/use-cases/generate-prediction.use-case";
import { GetPredictionHistoryUseCase } from "./application/use-cases/get-prediction-history.use-case";
import {
  RecalculateSubjectPredictionUseCase,
  STUDENT_SUBJECT_PREDICTION_REPO,
  USER_SERVICE_CLIENT,
} from "./application/use-cases/recalculate-subject-prediction.use-case";
import { GetMySubjectPredictionUseCase } from "./application/use-cases/get-my-subject-prediction.use-case";
import { GetStudentSubjectPredictionUseCase } from "./application/use-cases/get-student-subject-prediction.use-case";
import { ListSubjectPredictionsUseCase } from "./application/use-cases/list-subject-predictions.use-case";
import { RequestStudentPredictionUseCase } from "./application/use-cases/request-student-prediction.use-case";
import { GenerateSubjectPredictionUseCase } from "./application/use-cases/generate-subject-prediction.use-case";
import { RequestSubjectPredictionUseCase } from "./application/use-cases/request-subject-prediction.use-case";

@Module({
  imports: [
    createLoggerModule("prediction-service"),
    ConfigModule.forRoot({ isGlobal: true }),

    // Shared "mentorapredict" Postgres database (same as
    // academic-service/analytics-service): student_subject_predictions and
    // prediction_logs.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: "postgres",
        host: cfg.get("POSTGRES_HOST", "localhost"),
        port: cfg.get<number>("POSTGRES_PORT", 5432),
        username: cfg.get("POSTGRES_USER", "mp_user"),
        password: cfg.get("POSTGRES_PASSWORD", ""),
        database: cfg.get("POSTGRES_DB", "mentorapredict"),
        entities: [
          StudentSubjectPredictionOrmEntity,
          PredictionLogOrmEntity,
          UserReferenceOrmEntity,
          SubjectReferenceOrmEntity,
          PeriodReferenceOrmEntity,
          AiSettingsOrmEntity,
          AiUsageOrmEntity,
        ],
        // Schema changes go through TypeORM migrations (see src/data-source.ts) â€”
        // never auto-sync, in any environment. See docs/database/entity-relationship-diagram.md.
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([
      StudentSubjectPredictionOrmEntity,
      PredictionLogOrmEntity,
      UserReferenceOrmEntity,
      SubjectReferenceOrmEntity,
      PeriodReferenceOrmEntity,
      AiSettingsOrmEntity,
      AiUsageOrmEntity,
    ]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const privateKey = decodeJwtKey(cfg.get<string>("JWT_PRIVATE_KEY") || cfg.get<string>("JWT_PRIVATE_KEY_PATH"));
        const publicKey = decodeJwtKey(cfg.get<string>("JWT_PUBLIC_KEY") || cfg.get<string>("JWT_PUBLIC_KEY_PATH"));
        if (privateKey && publicKey) {
          return {
            privateKey,
            publicKey,
            signOptions: { algorithm: "RS256", issuer: "mentorapredict" },
          };
        }
        return { secret: cfg.get("JWT_SECRET", "dev-secret-change-in-prod") };
      },
    }),
  ],
  controllers: [PredictionController, AiSettingsController, InternalPredictionController, HealthController, RootController],
  providers: [
    InternalJwtService,
    RolesGuard,
    InternalServiceGuard,
    { provide: ANALYTICS_CLIENT, useClass: AnalyticsHttpClient },
    { provide: ACADEMIC_CONTEXT_CLIENT, useClass: AcademicHttpClient },
    { provide: USER_SERVICE_CLIENT, useClass: UserHttpClient },
    { provide: AI_PROVIDER, useClass: OpenAiRecommendationProvider },
    { provide: AI_SETTINGS_REPO, useClass: AiSettingsRepository },
    { provide: AI_USAGE_REPO, useClass: AiUsageRepository },
    { provide: SECRET_CIPHER, useClass: AesSecretCipher },
    { provide: AI_CONNECTION_CHECKER, useClass: OpenAiConnectionChecker },
    AiRuntimeConfigService,
    GetAiSettingsUseCase,
    UpdateAiSettingsUseCase,
    TestAiConnectionUseCase,
    GetAiUsageUseCase,
    { provide: PREDICTION_LOG_REPO, useClass: PredictionLogRepository },
    { provide: STUDENT_SUBJECT_PREDICTION_REPO, useClass: StudentSubjectPredictionRepository },
    GeneratePredictionUseCase,
    GetPredictionHistoryUseCase,
    RecalculateSubjectPredictionUseCase,
    GetMySubjectPredictionUseCase,
    GetStudentSubjectPredictionUseCase,
    ListSubjectPredictionsUseCase,
    RequestStudentPredictionUseCase,
    GenerateSubjectPredictionUseCase,
    RequestSubjectPredictionUseCase,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(correlationContextMiddleware).forRoutes("*");
  }
}
