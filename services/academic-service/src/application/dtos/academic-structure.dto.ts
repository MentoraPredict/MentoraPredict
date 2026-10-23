import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SHIFTS } from '../../domain/entities/institution-config.entity';

export class CreateSectionDto {
  @ApiProperty()
  @IsUUID()
  schoolYearId!: string;

  @ApiProperty({ example: 'EGB_8' })
  @IsString()
  @IsNotEmpty()
  gradeLevelCode!: string;

  @ApiProperty({ example: 'A', maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  name!: string;

  @ApiProperty({ enum: SHIFTS })
  @IsIn(SHIFTS)
  shift!: (typeof SHIFTS)[number];

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  @Max(100)
  capacity!: number;

  @ApiPropertyOptional({ nullable: true, description: 'Docente tutor del paralelo' })
  @IsUUID()
  @IsOptional()
  tutorId?: string | null;
}

export class UpdateSectionDto {
  @ApiPropertyOptional({ maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: SHIFTS })
  @IsIn(SHIFTS)
  @IsOptional()
  shift?: (typeof SHIFTS)[number];

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ nullable: true })
  @IsUUID()
  @IsOptional()
  tutorId?: string | null;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CurriculumItemDto {
  @ApiProperty()
  @IsUUID()
  subjectCatalogId!: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(40)
  weeklyHours!: number;
}

export class SetCurriculumDto {
  @ApiProperty({ type: [CurriculumItemDto] })
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => CurriculumItemDto)
  items!: CurriculumItemDto[];
}

export class CreateSectionCourseDto {
  @ApiProperty()
  @IsUUID()
  subjectCatalogId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsUUID()
  @IsOptional()
  teacherId?: string | null;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(40)
  @IsOptional()
  weeklyHours?: number;
}

export class AssignCourseTeacherDto {
  @ApiProperty({ nullable: true, description: 'null deja el curso sin docente' })
  @IsUUID()
  @IsOptional()
  teacherId!: string | null;
}

export class UpdateSubjectCatalogDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ nullable: true, example: 'Matemática' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  area?: string | null;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
