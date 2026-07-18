/// <reference types="node" />
import "dotenv/config";
import { DataSource } from "typeorm";
import { FacultyOrmEntity } from "./infrastructure/persistence/faculty.orm-entity";
import { CareerOrmEntity } from "./infrastructure/persistence/career.orm-entity";
import { AcademicPeriodOrmEntity } from "./infrastructure/persistence/academic-period.orm-entity";
import { SubjectOrmEntity } from "./infrastructure/persistence/subject.orm-entity";
import { EvaluationOrmEntity } from "./infrastructure/persistence/evaluation.orm-entity";
import { EnrollmentOrmEntity } from "./infrastructure/persistence/enrollment.orm-entity";
import { GradeOrmEntity } from "./infrastructure/persistence/grade.orm-entity";
import { GradeHistoryOrmEntity } from "./infrastructure/persistence/grade-history.orm-entity";
import { SubjectTeacherOrmEntity } from "./infrastructure/persistence/subject-teacher.orm-entity";
import { GradeImportOrmEntity } from "./infrastructure/persistence/grade-import.orm-entity";
import { TopicOrmEntity } from "./infrastructure/persistence/topic.orm-entity";
import { WeeklyCheckInOrmEntity } from "./infrastructure/persistence/weekly-check-in.orm-entity";
import { UserReferenceOrmEntity } from "./infrastructure/persistence/user-reference.orm-entity";

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "mp_user",
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DB || "mentorapredict",
  entities: [
    FacultyOrmEntity,
    CareerOrmEntity,
    AcademicPeriodOrmEntity,
    SubjectOrmEntity,
    EvaluationOrmEntity,
    EnrollmentOrmEntity,
    GradeOrmEntity,
    GradeHistoryOrmEntity,
    SubjectTeacherOrmEntity,
    GradeImportOrmEntity,
    TopicOrmEntity,
    WeeklyCheckInOrmEntity,
    UserReferenceOrmEntity,
  ],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  migrationsTableName: "migrations_academic",
  synchronize: false,
});
