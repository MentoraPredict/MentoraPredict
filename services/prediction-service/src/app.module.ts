import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";

import { PredictionController } from "./infrastructure/controllers/prediction.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";

import { PredictionLogDoc, PredictionLogSchema } from "./infrastructure/persistence/prediction-log.schema";
import { PredictionLogRepository } from "./infrastructure/persistence/prediction-log.repository";

import { InternalJwtService } from "./infrastructure/auth/internal-jwt.service";
import { AnalyticsHttpClient } from "./infrastructure/adapters/analytics-http.client";
import { AcademicHttpClient } from "./infrastructure/adapters/academic-http.client";
import { OpenAiRecommendationProvider } from "./infrastructure/adapters/openai-recommendation.provider";
import { decodeJwtKey } from "./infrastructure/config/jwt-key.util";

import {
  GeneratePredictionUseCase,
  ANALYTICS_CLIENT,
  ACADEMIC_CONTEXT_CLIENT,
  AI_PROVIDER,
  PREDICTION_LOG_REPO,
} from "./application/use-cases/generate-prediction.use-case";
import { GetPredictionHistoryUseCase } from "./application/use-cases/get-prediction-history.use-case";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get("MONGO_URL") ?? buildMongoUri(cfg),
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
  controllers: [PredictionController, HealthController, RootController],
  providers: [
    InternalJwtService,
    { provide: ANALYTICS_CLIENT, useClass: AnalyticsHttpClient },
    { provide: ACADEMIC_CONTEXT_CLIENT, useClass: AcademicHttpClient },
    { provide: AI_PROVIDER, useClass: OpenAiRecommendationProvider },
    { provide: PREDICTION_LOG_REPO, useClass: PredictionLogRepository },
    GeneratePredictionUseCase,
    GetPredictionHistoryUseCase,
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
