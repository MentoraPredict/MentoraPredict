import "reflect-metadata";
import { DataSource } from "typeorm";
import { AcademicPeriodOrmEntity } from "./infrastructure/persistence/academic-period.orm-entity";
import { CareerOrmEntity } from "./infrastructure/persistence/career.orm-entity";
import { EnrollmentOrmEntity } from "./infrastructure/persistence/enrollment.orm-entity";
import { EvaluationOrmEntity } from "./infrastructure/persistence/evaluation.orm-entity";
import { FacultyOrmEntity } from "./infrastructure/persistence/faculty.orm-entity";
import { GradeHistoryOrmEntity } from "./infrastructure/persistence/grade-history.orm-entity";
import { GradeOrmEntity } from "./infrastructure/persistence/grade.orm-entity";
import { SubjectTeacherOrmEntity } from "./infrastructure/persistence/subject-teacher.orm-entity";
import { SubjectOrmEntity } from "./infrastructure/persistence/subject.orm-entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  entities: [
    AcademicPeriodOrmEntity,
    CareerOrmEntity,
    EnrollmentOrmEntity,
    EvaluationOrmEntity,
    FacultyOrmEntity,
    GradeHistoryOrmEntity,
    GradeOrmEntity,
    SubjectTeacherOrmEntity,
    SubjectOrmEntity,
  ],

  migrations: ["dist/migrations/*.js"],

  synchronize: false,
});
