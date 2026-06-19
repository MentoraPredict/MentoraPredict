import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserProfileOrmEntity } from "./infrastructure/persistence/user-profile.orm-entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  entities: [UserProfileOrmEntity],

  migrations: ["dist/migrations/*.js"],

  synchronize: false,
});
