/// <reference types="node" />
import "dotenv/config";
import { DataSource } from "typeorm";
import { StudentSubjectPredictionOrmEntity } from "./infrastructure/persistence/student-subject-prediction.orm-entity";
import { PredictionLogOrmEntity } from "./infrastructure/persistence/prediction-log.orm-entity";
import { UserReferenceOrmEntity } from "./infrastructure/persistence/user-reference.orm-entity";
import { SubjectReferenceOrmEntity } from "./infrastructure/persistence/subject-reference.orm-entity";
import { PeriodReferenceOrmEntity } from "./infrastructure/persistence/period-reference.orm-entity";
import { AiSettingsOrmEntity } from "./infrastructure/persistence/ai-settings.orm-entity";
import { AiUsageOrmEntity } from "./infrastructure/persistence/ai-usage.orm-entity";

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "mp_user",
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DB || "mentorapredict",
  entities: [
    StudentSubjectPredictionOrmEntity,
    PredictionLogOrmEntity,
    UserReferenceOrmEntity,
    SubjectReferenceOrmEntity,
    PeriodReferenceOrmEntity,
    AiSettingsOrmEntity,
    AiUsageOrmEntity,
  ],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  migrationsTableName: "migrations_prediction",
  synchronize: false,
});
