import "reflect-metadata";
import { DataSource } from "typeorm";
import { AlertOrmEntity } from "./infrastructure/persistence/alert.orm-entity";
import { StudentMetricsOrmEntity } from "./infrastructure/persistence/student-metrics.orm-entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  entities: [AlertOrmEntity, StudentMetricsOrmEntity],

  migrations: ["dist/migrations/*.js"],

  synchronize: false,
});
