import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";

import { AnalyticsController } from "./infrastructure/controllers/analytics.controller";
import { AlertsController } from "./infrastructure/controllers/alerts.controller";
import { InternalAnalyticsController } from "./infrastructure/controllers/internal-analytics.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";

import { StudentMetricsOrmEntity } from "./infrastructure/persistence/student-metrics.orm-entity";
import { AlertOrmEntity } from "./infrastructure/persistence/alert.orm-entity";
import { StudentMetricsRepository } from "./infrastructure/persistence/student-metrics.repository";
import { AlertRepository } from "./infrastructure/persistence/alert.repository";
import {
  DatasetVersion,
  DatasetVersionSchema,
} from "./infrastructure/persistence/dataset-version.schema";
import { DatasetVersionRepository } from "./infrastructure/persistence/dataset-version.repository";

import { RedisClient } from "./infrastructure/cache/redis.client";
import { MetricsCacheAdapter } from "./infrastructure/cache/metrics-cache.adapter";
import { AcademicHttpClient } from "./infrastructure/adapters/academic-http.client";
import { InternalJwtService } from "./infrastructure/auth/internal-jwt.service";
import { decodeJwtKey } from "./infrastructure/config/jwt-key.util";

import { CalculateAverageUseCase } from "./application/use-cases/calculate-average.use-case";
import { CalculateTrendUseCase } from "./application/use-cases/calculate-trend.use-case";
import { CalculateComplianceUseCase } from "./application/use-cases/calculate-compliance.use-case";
import { ClassifyRiskUseCase } from "./application/use-cases/classify-risk.use-case";
import { GenerateAlertsUseCase } from "./application/use-cases/generate-alerts.use-case";
import { GetAlertsUseCase } from "./application/use-cases/get-alerts.use-case";
import { GetStudentDashboardUseCase } from "./application/use-cases/get-student-dashboard.use-case";
import { GetTeacherDashboardUseCase } from "./application/use-cases/get-teacher-dashboard.use-case";
import { GetAdminDashboardUseCase } from "./application/use-cases/get-admin-dashboard.use-case";
import { GetRiskSnapshotUseCase } from "./application/use-cases/get-risk-snapshot.use-case";
import { RecalculateStudentMetricsUseCase } from "./application/use-cases/recalculate-student-metrics.use-case";

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
        entities: [StudentMetricsOrmEntity, AlertOrmEntity],
        synchronize: cfg.get("NODE_ENV") !== "production",
      }),
    }),
    TypeOrmModule.forFeature([StudentMetricsOrmEntity, AlertOrmEntity]),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get("MONGO_URL") ?? buildMongoUri(cfg),
      }),
    }),
    MongooseModule.forFeature([
      { name: DatasetVersion.name, schema: DatasetVersionSchema },
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
  controllers: [
    AnalyticsController,
    AlertsController,
    InternalAnalyticsController,
    HealthController,
    RootController,
  ],
  providers: [
    RedisClient,
    InternalJwtService,
    { provide: "IAcademicServiceClient", useClass: AcademicHttpClient },
    {
      provide: "IStudentMetricsRepository",
      useClass: StudentMetricsRepository,
    },
    { provide: "IAlertRepository", useClass: AlertRepository },
    {
      provide: "IDatasetVersionRepository",
      useClass: DatasetVersionRepository,
    },
    { provide: "IMetricsCachePort", useClass: MetricsCacheAdapter },
    {
      provide: "RISK_HIGH_THRESHOLD",
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        cfg.get<number>("RISK_HIGH_THRESHOLD", 40),
    },
    {
      provide: "RISK_CRITICAL_THRESHOLD",
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        cfg.get<number>("RISK_CRITICAL_THRESHOLD", 25),
    },
    CalculateAverageUseCase,
    CalculateTrendUseCase,
    CalculateComplianceUseCase,
    ClassifyRiskUseCase,
    GenerateAlertsUseCase,
    GetAlertsUseCase,
    GetStudentDashboardUseCase,
    GetTeacherDashboardUseCase,
    GetAdminDashboardUseCase,
    GetRiskSnapshotUseCase,
    RecalculateStudentMetricsUseCase,
  ],
})
export class AppModule {}

function buildMongoUri(cfg: ConfigService): string {
  const user = cfg.get("MONGO_USER", "mp_mongo_user");
  const pass = cfg.get("MONGO_PASSWORD", "");
  const host = cfg.get("MONGO_HOST", "localhost");
  const port = cfg.get("MONGO_PORT", 27017);
  const db = cfg.get("MONGO_DB", "mentorapredict_nosql");
  return `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;
}
