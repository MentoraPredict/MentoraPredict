import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { createLoggerModule, correlationContextMiddleware } from "@mentorapredict/shared-logger";

import { PredictionController } from "./infrastructure/controllers/prediction.controller";
import { InternalPredictionController } from "./infrastructure/controllers/internal-prediction.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";

import { PredictionLogDoc, PredictionLogSchema } from "./infrastructure/persistence/prediction-log.schema";
import { PredictionLogRepository } from "./infrastructure/persistence/prediction-log.repository";
import { StudentSubjectPredictionOrmEntity } from "./infrastructure/persistence/student-subject-prediction.orm-entity";
import { StudentSubjectPredictionRepository } from "./infrastructure/persistence/student-subject-prediction.repository";

import { InternalJwtService } from "./infrastructure/auth/internal-jwt.service";
import { AnalyticsHttpClient } from "./infrastructure/adapters/analytics-http.client";
import { AcademicHttpClient } from "./infrastructure/adapters/academic-http.client";
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

    // Fase 8 — first Postgres connection in prediction-service, for
    // student_subject_predictions (same shared "mentorapredict" database as
    // academic-service/analytics-service). Everything else in this service
    // stays on Mongo (prediction_logs).
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: "postgres",
        host: cfg.get("POSTGRES_HOST", "localhost"),
        port: cfg.get<number>("POSTGRES_PORT", 5432),
        username: cfg.get("POSTGRES_USER", "mp_user"),
        password: cfg.get("POSTGRES_PASSWORD", ""),
        database: cfg.get("POSTGRES_DB", "mentorapredict"),
        entities: [StudentSubjectPredictionOrmEntity],
        synchronize: cfg.get("NODE_ENV") !== "production",
      }),
    }),
    TypeOrmModule.forFeature([StudentSubjectPredictionOrmEntity]),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get("MONGO_URL") ?? buildMongoUri(cfg),
        serverSelectionTimeoutMS: 5000,
        // Connects in the background instead of blocking Nest's bootstrap:
        // without this, an unreachable MongoDB crashes the whole service
        // (NestFactory.create() awaits the connection and rethrows once
        // retries are exhausted). Queries just buffer/timeout individually
        // while disconnected — handled by the try/catch in PredictionLogRepository.
        lazyConnection: true,
        // Default is 10s per buffered query — too slow for a request path;
        // fail faster so callers hit the try/catch sooner.
        bufferTimeoutMS: 3000,
      }),
    }),
    MongooseModule.forFeature([
      { name: PredictionLogDoc.name, schema: PredictionLogSchema },
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
  controllers: [PredictionController, InternalPredictionController, HealthController, RootController],
  providers: [
    InternalJwtService,
    RolesGuard,
    InternalServiceGuard,
    { provide: ANALYTICS_CLIENT, useClass: AnalyticsHttpClient },
    { provide: ACADEMIC_CONTEXT_CLIENT, useClass: AcademicHttpClient },
    { provide: AI_PROVIDER, useClass: OpenAiRecommendationProvider },
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

function buildMongoUri(cfg: ConfigService): string {
  const user = cfg.get("MONGO_USER", "mp_mongo_user");
  const pass = cfg.get("MONGO_PASSWORD", "");
  const host = cfg.get("MONGO_HOST", "localhost");
  const port = cfg.get("MONGO_PORT", 27017);
  const db = cfg.get("MONGO_DB", "mentorapredict_nosql");
  return `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;
}
