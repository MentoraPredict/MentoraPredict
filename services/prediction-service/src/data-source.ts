/// <reference types="node" />
import "dotenv/config";
import { DataSource } from "typeorm";
import { StudentSubjectPredictionOrmEntity } from "./infrastructure/persistence/student-subject-prediction.orm-entity";

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "mp_user",
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DB || "mentorapredict",
  entities: [StudentSubjectPredictionOrmEntity],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  migrationsTableName: "migrations_prediction",
  synchronize: false,
});
