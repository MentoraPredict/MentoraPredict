/// <reference types="node" />
import "dotenv/config";
import { DataSource } from "typeorm";
import { StudentMetricsOrmEntity } from "./infrastructure/persistence/student-metrics.orm-entity";
import { StudentSubjectMetricsOrmEntity } from "./infrastructure/persistence/student-subject-metrics.orm-entity";
import { AlertOrmEntity } from "./infrastructure/persistence/alert.orm-entity";
import { DeviceTokenOrmEntity } from "./notifications/infrastructure/persistence/device-token.orm-entity";
import { NotificationOrmEntity } from "./notifications/infrastructure/persistence/notification.orm-entity";

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "mp_user",
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DB || "mentorapredict",
  entities: [
    StudentMetricsOrmEntity,
    StudentSubjectMetricsOrmEntity,
    AlertOrmEntity,
    DeviceTokenOrmEntity,
    NotificationOrmEntity,
  ],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  migrationsTableName: "migrations_analytics",
  synchronize: false,
});
