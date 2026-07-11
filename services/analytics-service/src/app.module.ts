import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { createLoggerModule } from "@mentorapredict/shared-logger";

import { AnalyticsController } from "./infrastructure/controllers/analytics.controller";
import { AlertsController } from "./infrastructure/controllers/alerts.controller";
import { InternalAnalyticsController } from "./infrastructure/controllers/internal-analytics.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";

import { StudentMetricsOrmEntity } from "./infrastructure/persistence/student-metrics.orm-entity";
import { AlertOrmEntity } from "./infrastructure/persistence/alert.orm-entity";
import { StudentSubjectMetricsOrmEntity } from "./infrastructure/persistence/student-subject-metrics.orm-entity";
import { StudentMetricsRepository } from "./infrastructure/persistence/student-metrics.repository";
import { AlertRepository } from "./infrastructure/persistence/alert.repository";
import { StudentSubjectMetricsRepository } from "./infrastructure/persistence/student-subject-metrics.repository";
import {
  DatasetVersion,
  DatasetVersionSchema,
} from "./infrastructure/persistence/dataset-version.schema";
import { DatasetVersionRepository } from "./infrastructure/persistence/dataset-version.repository";

import { RedisClient } from "./infrastructure/cache/redis.client";
import { MetricsCacheAdapter } from "./infrastructure/cache/metrics-cache.adapter";
import { AcademicHttpClient } from "./infrastructure/adapters/academic-http.client";
import { PredictionHttpClient } from "./infrastructure/adapters/prediction-http.client";
import { InternalJwtService } from "./infrastructure/auth/internal-jwt.service";
import { decodeJwtKey } from "./infrastructure/config/jwt-key.util";
import { RolesGuard } from "./infrastructure/guards/roles.guard";

// Notifications — self-contained module (domain/application/infrastructure),
// kept inside analytics-service to avoid standing up a new deployable
// service, but isolated so its logic never mixes with analytics' own
// risk/metrics domain. See docs/adr/0003-messaging-and-notifications.md.
import { NotificationsController } from "./notifications/infrastructure/controllers/notifications.controller";
import { InternalNotificationsController } from "./notifications/infrastructure/controllers/internal-notifications.controller";
import { NotificationOrmEntity } from "./notifications/infrastructure/persistence/notification.orm-entity";
import { NotificationRepository } from "./notifications/infrastructure/persistence/notification.repository";
import { DeviceTokenOrmEntity } from "./notifications/infrastructure/persistence/device-token.orm-entity";
import { DeviceTokenRepository } from "./notifications/infrastructure/persistence/device-token.repository";
import { UserHttpClient } from "./notifications/infrastructure/adapters/user-http.client";
import { ExpoPushClient } from "./notifications/infrastructure/adapters/expo-push.client";
import { NotificationsGateway } from "./notifications/infrastructure/gateways/notifications.gateway";
import { NotificationDeliveryService } from "./notifications/application/services/notification-delivery.service";
import { GetMyNotificationsUseCase } from "./notifications/application/use-cases/get-my-notifications.use-case";
import { MarkNotificationReadUseCase } from "./notifications/application/use-cases/mark-notification-read.use-case";
import { MarkAllNotificationsReadUseCase } from "./notifications/application/use-cases/mark-all-notifications-read.use-case";
import { CreateNotificationUseCase } from "./notifications/application/use-cases/create-notification.use-case";
import { RegisterDeviceTokenUseCase } from "./notifications/application/use-cases/register-device-token.use-case";
import { UnregisterDeviceTokenUseCase } from "./notifications/application/use-cases/unregister-device-token.use-case";

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
import { GetStudentSubjectMetricsUseCase } from "./application/use-cases/get-student-subject-metrics.use-case";
import { GetSubjectMetricsSummaryUseCase } from "./application/use-cases/get-subject-metrics-summary.use-case";
import { GetLatestSubjectMetricUseCase } from "./application/use-cases/get-latest-subject-metric.use-case";
import { GetSubjectRiskUseCase } from "./application/use-cases/get-subject-risk.use-case";
import { GetSubjectAlertsUseCase } from "./application/use-cases/get-subject-alerts.use-case";
import { ResolveAlertUseCase } from "./application/use-cases/resolve-alert.use-case";
import { GetAggregatedMetricsUseCase } from "./application/use-cases/get-aggregated-metrics.use-case";

@Module({
  imports: [
    createLoggerModule("analytics-service"),
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
        entities: [
          StudentMetricsOrmEntity,
          AlertOrmEntity,
          StudentSubjectMetricsOrmEntity,
          NotificationOrmEntity,
          DeviceTokenOrmEntity,
        ],
        synchronize: cfg.get("NODE_ENV") !== "production",
      }),
    }),
    TypeOrmModule.forFeature([
      StudentMetricsOrmEntity,
      AlertOrmEntity,
      StudentSubjectMetricsOrmEntity,
      NotificationOrmEntity,
      DeviceTokenOrmEntity,
    ]),

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
        const privateKey = decodeJwtKey(
          cfg.get<string>("JWT_PRIVATE_KEY") ||
            cfg.get<string>("JWT_PRIVATE_KEY_PATH"),
        );
        const publicKey = decodeJwtKey(
          cfg.get<string>("JWT_PUBLIC_KEY") ||
            cfg.get<string>("JWT_PUBLIC_KEY_PATH"),
        );
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
    NotificationsController,
    InternalAnalyticsController,
    InternalNotificationsController,
    HealthController,
    RootController,
  ],
  providers: [
    RedisClient,
    InternalJwtService,
    RolesGuard,
    { provide: "IAcademicServiceClient", useClass: AcademicHttpClient },
    { provide: "IPredictionClientPort", useClass: PredictionHttpClient },
    { provide: "IUserServiceClient", useClass: UserHttpClient },
    {
      provide: "IStudentMetricsRepository",
      useClass: StudentMetricsRepository,
    },
    {
      provide: "IStudentSubjectMetricsRepository",
      useClass: StudentSubjectMetricsRepository,
    },
    { provide: "IAlertRepository", useClass: AlertRepository },
    { provide: "INotificationRepository", useClass: NotificationRepository },
    { provide: "IDeviceTokenRepository", useClass: DeviceTokenRepository },
    { provide: "IPushNotificationClient", useClass: ExpoPushClient },
    {
      provide: "IDatasetVersionRepository",
      useClass: DatasetVersionRepository,
    },
    { provide: "IMetricsCachePort", useClass: MetricsCacheAdapter },
    NotificationsGateway,
    NotificationDeliveryService,
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
    GetStudentSubjectMetricsUseCase,
    GetSubjectMetricsSummaryUseCase,
    GetLatestSubjectMetricUseCase,
    GetSubjectRiskUseCase,
    GetSubjectAlertsUseCase,
    ResolveAlertUseCase,
    GetMyNotificationsUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    GetAggregatedMetricsUseCase,
    CreateNotificationUseCase,
    RegisterDeviceTokenUseCase,
    UnregisterDeviceTokenUseCase,
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
