import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";

import { AcademicController } from "./infrastructure/controllers/academic.controller";
import { InternalAcademicController } from "./infrastructure/controllers/internal-academic.controller";
import { ObservationsController } from "./infrastructure/controllers/observations.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { RootController } from "./infrastructure/controllers/root.controller";

import { FacultyOrmEntity } from "./infrastructure/persistence/faculty.orm-entity";
import { CareerOrmEntity } from "./infrastructure/persistence/career.orm-entity";
import { AcademicPeriodOrmEntity } from "./infrastructure/persistence/academic-period.orm-entity";
import { SubjectOrmEntity } from "./infrastructure/persistence/subject.orm-entity";
import { EvaluationOrmEntity } from "./infrastructure/persistence/evaluation.orm-entity";
import { EnrollmentOrmEntity } from "./infrastructure/persistence/enrollment.orm-entity";
import { GradeOrmEntity } from "./infrastructure/persistence/grade.orm-entity";
import { GradeHistoryOrmEntity } from "./infrastructure/persistence/grade-history.orm-entity";
import { SubjectTeacherOrmEntity } from "./infrastructure/persistence/subject-teacher.orm-entity";
import {
  TeacherObservationDoc,
  TeacherObservationSchema,
} from "./infrastructure/persistence/teacher-observation.schema";

import { SubjectRepository } from "./infrastructure/persistence/subject.repository";
import { FacultyRepository } from "./infrastructure/persistence/faculty.repository";
import { CareerRepository } from "./infrastructure/persistence/career.repository";
import { EvaluationRepository } from "./infrastructure/persistence/evaluation.repository";
import { EnrollmentRepository } from "./infrastructure/persistence/enrollment.repository";
import { GradeRepository } from "./infrastructure/persistence/grade.repository";
import { AcademicPeriodRepository } from "./infrastructure/persistence/academic-period.repository";
import { SubjectTeacherRepository } from "./infrastructure/persistence/subject-teacher.repository";
import { GradeHistoryRepository } from "./infrastructure/persistence/grade-history.repository";
import { TeacherObservationRepository } from "./infrastructure/persistence/teacher-observation.repository";
import { UserRoleHttpAdapter } from "./infrastructure/adapters/user-role-http.adapter";
import { RedisClient } from "./infrastructure/cache/redis.client";
import { InternalServiceGuard } from "./infrastructure/guards/internal-service.guard";
import { TeacherRoleGuard } from "./infrastructure/guards/teacher-role.guard";
import { RolesGuard } from "./infrastructure/guards/roles.guard";
import { JwtAuthGuard } from "./infrastructure/guards/jwt-auth.guard";
import { InternalJwtService } from "./infrastructure/auth/internal-jwt.service";
import { decodeJwtKey } from "./infrastructure/config/jwt-key.util";

import { RecordGradeUseCase } from "./application/use-cases/record-grade.use-case";
import { RegisterGradeUseCase } from "./application/use-cases/register-grade.use-case";
import { UpdateGradeUseCase } from "./application/use-cases/update-grade.use-case";
import { EnrollStudentUseCase } from "./application/use-cases/enroll-student.use-case";
import { CreateEvaluationUseCase } from "./application/use-cases/create-evaluation.use-case";
import { AssignTeacherUseCase } from "./application/use-cases/assign-teacher.use-case";
import { ImportGradesUseCase } from "./application/use-cases/import-grades.use-case";
import { GetStudentGradesUseCase } from "./application/use-cases/get-student-grades.use-case";
import { GetStudentEnrollmentsUseCase } from "./application/use-cases/get-student-enrollments.use-case";
import { GetSubjectEnrollmentsUseCase } from "./application/use-cases/get-subject-enrollments.use-case";
import { CreateObservationUseCase } from "./application/use-cases/create-observation.use-case";
import { GetObservationsByStudentUseCase } from "./application/use-cases/get-observations-by-student.use-case";

// Faculty use-cases
import { CreateFacultyUseCase } from "./application/use-cases/create-faculty.use-case";
import { GetFacultyUseCase } from "./application/use-cases/get-faculty.use-case";
import { ListFacultiesUseCase } from "./application/use-cases/list-faculties.use-case";
import { UpdateFacultyUseCase } from "./application/use-cases/update-faculty.use-case";
import { ChangeFacultyStatusUseCase } from "./application/use-cases/change-faculty-status.use-case";
import { DeleteFacultyUseCase } from "./application/use-cases/delete-faculty.use-case";

// Academic Period use-cases
import { CreateAcademicPeriodUseCase } from "./application/use-cases/create-academic-period.use-case";
import { GetAcademicPeriodUseCase } from "./application/use-cases/get-academic-period.use-case";
import { ListAcademicPeriodsUseCase } from "./application/use-cases/list-academic-periods.use-case";
import { GetActivePeriodUseCase } from "./application/use-cases/get-active-period.use-case";
import { UpdateAcademicPeriodUseCase } from "./application/use-cases/update-academic-period.use-case";
import { ChangeAcademicPeriodStatusUseCase } from "./application/use-cases/change-academic-period-status.use-case";
import { DeleteAcademicPeriodUseCase } from "./application/use-cases/delete-academic-period.use-case";

// Career use-cases
import { CreateCareerUseCase } from "./application/use-cases/create-career.use-case";
import { GetCareerUseCase } from "./application/use-cases/get-career.use-case";
import { ListCareersUseCase } from "./application/use-cases/list-careers.use-case";
import { UpdateCareerUseCase } from "./application/use-cases/update-career.use-case";
import { ChangeCareerStatusUseCase } from "./application/use-cases/change-career-status.use-case";
import { DeleteCareerUseCase } from "./application/use-cases/delete-career.use-case";

// Subject use-cases
import { CreateSubjectUseCase } from "./application/use-cases/create-subject.use-case";
import { GetSubjectUseCase } from "./application/use-cases/get-subject.use-case";
import { ListSubjectsUseCase } from "./application/use-cases/list-subjects.use-case";
import { UpdateSubjectUseCase } from "./application/use-cases/update-subject.use-case";
import { ChangeSubjectStatusUseCase } from "./application/use-cases/change-subject-status.use-case";
import { DeleteSubjectUseCase } from "./application/use-cases/delete-subject.use-case";

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
        ],
        synchronize: cfg.get("NODE_ENV") !== "production",
        logging: cfg.get("NODE_ENV") === "development",
      }),
    }),

    TypeOrmModule.forFeature([
      FacultyOrmEntity,
      CareerOrmEntity,
      AcademicPeriodOrmEntity,
      SubjectOrmEntity,
      EvaluationOrmEntity,
      EnrollmentOrmEntity,
      GradeOrmEntity,
      GradeHistoryOrmEntity,
      SubjectTeacherOrmEntity,
    ]),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get("MONGO_URL") ?? buildMongoUri(cfg),
      }),
    }),
    MongooseModule.forFeature([
      { name: TeacherObservationDoc.name, schema: TeacherObservationSchema },
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
    AcademicController,
    InternalAcademicController,
    ObservationsController,
    HealthController,
    RootController,
  ],
  providers: [
    RedisClient,
    InternalJwtService,
    InternalServiceGuard,
    TeacherRoleGuard,
    RolesGuard,
    JwtAuthGuard,
    { provide: "IFacultyRepository", useClass: FacultyRepository },
    { provide: "ICareerRepository", useClass: CareerRepository },
    { provide: "ISubjectRepository", useClass: SubjectRepository },
    { provide: "IEvaluationRepository", useClass: EvaluationRepository },
    { provide: "IEnrollmentRepository", useClass: EnrollmentRepository },
    { provide: "IGradeRepository", useClass: GradeRepository },
    { provide: "IAcademicPeriodRepository", useClass: AcademicPeriodRepository },
    { provide: "ISubjectTeacherRepository", useClass: SubjectTeacherRepository },
    { provide: "IGradeHistoryRepository", useClass: GradeHistoryRepository },
    { provide: "ITeacherObservationRepository", useClass: TeacherObservationRepository },
    { provide: "ITeacherRolePort", useClass: UserRoleHttpAdapter },
    RecordGradeUseCase,
    RegisterGradeUseCase,
    UpdateGradeUseCase,
    EnrollStudentUseCase,
    CreateEvaluationUseCase,
    AssignTeacherUseCase,
    ImportGradesUseCase,
    GetStudentGradesUseCase,
    GetStudentEnrollmentsUseCase,
    GetSubjectEnrollmentsUseCase,
    CreateObservationUseCase,
    GetObservationsByStudentUseCase,
    // Faculty use-cases
    CreateFacultyUseCase,
    GetFacultyUseCase,
    ListFacultiesUseCase,
    UpdateFacultyUseCase,
    ChangeFacultyStatusUseCase,
    DeleteFacultyUseCase,
    // Academic Period use-cases
    CreateAcademicPeriodUseCase,
    GetAcademicPeriodUseCase,
    ListAcademicPeriodsUseCase,
    GetActivePeriodUseCase,
    UpdateAcademicPeriodUseCase,
    ChangeAcademicPeriodStatusUseCase,
    DeleteAcademicPeriodUseCase,
    // Career use-cases
    CreateCareerUseCase,
    GetCareerUseCase,
    ListCareersUseCase,
    UpdateCareerUseCase,
    ChangeCareerStatusUseCase,
    DeleteCareerUseCase,
    // Subject use-cases
    CreateSubjectUseCase,
    GetSubjectUseCase,
    ListSubjectsUseCase,
    UpdateSubjectUseCase,
    ChangeSubjectStatusUseCase,
    DeleteSubjectUseCase,
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
