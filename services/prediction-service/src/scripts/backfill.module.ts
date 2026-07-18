import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { decodeJwtKey } from '../infrastructure/config/jwt-key.util';
import { InternalJwtService } from '../infrastructure/auth/internal-jwt.service';
import { AcademicHttpClient } from '../infrastructure/adapters/academic-http.client';
import { UserHttpClient } from '../infrastructure/adapters/user-http.client';
import { ACADEMIC_CONTEXT_CLIENT } from '../application/use-cases/generate-prediction.use-case';
import { USER_SERVICE_CLIENT } from '../application/use-cases/recalculate-subject-prediction.use-case';
import { UserReferenceOrmEntity } from '../infrastructure/persistence/user-reference.orm-entity';
import { SubjectReferenceOrmEntity } from '../infrastructure/persistence/subject-reference.orm-entity';
import { PeriodReferenceOrmEntity } from '../infrastructure/persistence/period-reference.orm-entity';

/**
 * Minimal DI context for one-off backfill scripts — Postgres + the 2
 * internal HTTP clients only. Deliberately does NOT import the full
 * AppModule: that also wires up MongooseModule (real MongoDB Atlas
 * credentials, not available for local one-off scripts), which this
 * backfill doesn't need.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('POSTGRES_HOST', 'localhost'),
        port: cfg.get<number>('POSTGRES_PORT', 5432),
        username: cfg.get('POSTGRES_USER', 'mp_user'),
        password: cfg.get('POSTGRES_PASSWORD', ''),
        database: cfg.get('POSTGRES_DB', 'mentorapredict'),
        entities: [UserReferenceOrmEntity, SubjectReferenceOrmEntity, PeriodReferenceOrmEntity],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([UserReferenceOrmEntity, SubjectReferenceOrmEntity, PeriodReferenceOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const privateKey = decodeJwtKey(
          cfg.get<string>('JWT_PRIVATE_KEY') || cfg.get<string>('JWT_PRIVATE_KEY_PATH'),
        );
        const publicKey = decodeJwtKey(
          cfg.get<string>('JWT_PUBLIC_KEY') || cfg.get<string>('JWT_PUBLIC_KEY_PATH'),
        );
        if (privateKey && publicKey) {
          return { privateKey, publicKey, signOptions: { algorithm: 'RS256', issuer: 'mentorapredict' } };
        }
        return { secret: cfg.get('JWT_SECRET', 'dev-secret-change-in-prod') };
      },
    }),
  ],
  providers: [
    InternalJwtService,
    { provide: USER_SERVICE_CLIENT, useClass: UserHttpClient },
    { provide: ACADEMIC_CONTEXT_CLIENT, useClass: AcademicHttpClient },
  ],
  exports: [USER_SERVICE_CLIENT, ACADEMIC_CONTEXT_CLIENT],
})
export class BackfillModule {}
