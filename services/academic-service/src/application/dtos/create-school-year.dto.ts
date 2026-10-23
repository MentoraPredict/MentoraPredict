import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  IsInt,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MAX_PERIODS,
  MIN_PERIODS,
} from '../../domain/services/school-calendar';

export class SchoolYearPeriodInputDto {
  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2025-11-28' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: '2025-12-05' })
  @IsDateString()
  @IsOptional()
  gradesDueDate?: string;
}

export class CreateSchoolYearDto {
  @ApiProperty({ example: 'Año lectivo 2025-2026', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: '2025-2026', maxLength: 15 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  code!: string;

  @ApiProperty({ enum: ['SIERRA_AMAZONIA', 'COSTA_GALAPAGOS'] })
  @IsIn(['SIERRA_AMAZONIA', 'COSTA_GALAPAGOS'])
  regime!: 'SIERRA_AMAZONIA' | 'COSTA_GALAPAGOS';

  @ApiProperty({ enum: ['TRIMESTER', 'QUIMESTER', 'SEMESTER'] })
  @IsIn(['TRIMESTER', 'QUIMESTER', 'SEMESTER'])
  periodScheme!: 'TRIMESTER' | 'QUIMESTER' | 'SEMESTER';

  @ApiPropertyOptional({
    description: 'Cantidad de periodos de calificación (por defecto según el esquema)',
    minimum: MIN_PERIODS,
    maximum: MAX_PERIODS,
  })
  @IsInt()
  @Min(MIN_PERIODS)
  @Max(MAX_PERIODS)
  @IsOptional()
  periodsCount?: number;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-06-26' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: 200 })
  @IsInt()
  @Min(1)
  @Max(366)
  @IsOptional()
  minClassDays?: number;

  @ApiPropertyOptional({ example: '2026-06-29' })
  @IsDateString()
  @IsOptional()
  recoveryStartDate?: string;

  @ApiPropertyOptional({ example: '2026-07-03' })
  @IsDateString()
  @IsOptional()
  recoveryEndDate?: string;

  @ApiPropertyOptional({ example: '2026-07-06' })
  @IsDateString()
  @IsOptional()
  supplementaryStartDate?: string;

  @ApiPropertyOptional({ example: '2026-07-09' })
  @IsDateString()
  @IsOptional()
  supplementaryEndDate?: string;

  @ApiPropertyOptional({
    type: [SchoolYearPeriodInputDto],
    description:
      'Fechas de cada periodo. Si se omite, el año se divide en periodos iguales.',
  })
  @ValidateNested({ each: true })
  @Type(() => SchoolYearPeriodInputDto)
  @ArrayMaxSize(MAX_PERIODS)
  @IsOptional()
  periods?: SchoolYearPeriodInputDto[];
}

export class UpdateSchoolYearDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: ['SIERRA_AMAZONIA', 'COSTA_GALAPAGOS'] })
  @IsIn(['SIERRA_AMAZONIA', 'COSTA_GALAPAGOS'])
  @IsOptional()
  regime?: 'SIERRA_AMAZONIA' | 'COSTA_GALAPAGOS';

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(366)
  @IsOptional()
  minClassDays?: number;

  @ApiPropertyOptional({ nullable: true })
  @IsDateString()
  @IsOptional()
  recoveryStartDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsDateString()
  @IsOptional()
  recoveryEndDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsDateString()
  @IsOptional()
  supplementaryStartDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsDateString()
  @IsOptional()
  supplementaryEndDate?: string | null;
}

export class ChangeSchoolYearStatusDto {
  @ApiProperty({ enum: ['PLANNED', 'ACTIVE', 'FINISHED'] })
  @IsIn(['PLANNED', 'ACTIVE', 'FINISHED'])
  status!: 'PLANNED' | 'ACTIVE' | 'FINISHED';
}
