import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicController } from './infrastructure/controllers/academic.controller';
import { HealthController }   from './infrastructure/controllers/health.controller';

import { SubjectOrmEntity }    from './infrastructure/persistence/subject.orm-entity';
import { EvaluationOrmEntity } from './infrastructure/persistence/evaluation.orm-entity';
import { EnrollmentOrmEntity } from './infrastructure/persistence/enrollment.orm-entity';
import { GradeOrmEntity }      from './infrastructure/persistence/grade.orm-entity';

import { SubjectRepository }    from './infrastructure/persistence/subject.repository';
import { EvaluationRepository } from './infrastructure/persistence/evaluation.repository';
import { EnrollmentRepository } from './infrastructure/persistence/enrollment.repository';
import { GradeRepository }      from './infrastructure/persistence/grade.repository';

import { RecordGradeUseCase }       from './application/use-cases/record-grade.use-case';
import { EnrollStudentUseCase }     from './application/use-cases/enroll-student.use-case';
import { CreateEvaluationUseCase }  from './application/use-cases/create-evaluation.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host:     cfg.get('POSTGRES_HOST', 'localhost'),
        port:     cfg.get<number>('POSTGRES_PORT', 5432),
        username: cfg.get('POSTGRES_USER', 'mp_user'),
        password: cfg.get('POSTGRES_PASSWORD', ''),
        database: cfg.get('POSTGRES_DB', 'mentorapredict'),
        entities: [SubjectOrmEntity, EvaluationOrmEntity, EnrollmentOrmEntity, GradeOrmEntity],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging:     cfg.get('NODE_ENV') === 'development',
      }),
    }),

    TypeOrmModule.forFeature([SubjectOrmEntity, EvaluationOrmEntity, EnrollmentOrmEntity, GradeOrmEntity]),
  ],
  controllers: [AcademicController, HealthController],
  providers: [
    { provide: 'ISubjectRepository',    useClass: SubjectRepository },
    { provide: 'IEvaluationRepository', useClass: EvaluationRepository },
    { provide: 'IEnrollmentRepository', useClass: EnrollmentRepository },
    { provide: 'IGradeRepository',      useClass: GradeRepository },
    RecordGradeUseCase,
    EnrollStudentUseCase,
    CreateEvaluationUseCase,
  ],
})
export class AppModule {}
