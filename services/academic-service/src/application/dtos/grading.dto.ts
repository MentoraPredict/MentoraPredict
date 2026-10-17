import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PROMOTION_OUTCOMES } from '../../domain/entities/grading.entity';

export class GradingComponentDto {
  @ApiProperty({ example: 'FORMATIVE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiProperty({ example: 'Formativa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: 70 })
  @IsNumber({ maxDecimalPlaces: 2 })
  weight!: number;
}

export class UpdateGradingComponentsDto {
  @ApiProperty({ type: [GradingComponentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => GradingComponentDto)
  components!: GradingComponentDto[];
}

export class CreateActivityDto {
  @ApiProperty()
  @IsUUID()
  periodId!: string;

  @ApiProperty({ example: 'FORMATIVE' })
  @IsString()
  @IsNotEmpty()
  componentCode!: string;

  @ApiProperty({ example: 'Lección 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsDateString()
  @IsOptional()
  dueDate?: string | null;
}

export class UpdateActivityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  componentCode?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsDateString()
  @IsOptional()
  dueDate?: string | null;
}

export class ToggleActivityDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}

export class GradeEntryDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty()
  @IsUUID()
  activityId!: string;

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  value!: number;
}

export class SaveGradesDto {
  @ApiProperty()
  @IsUUID()
  periodId!: string;

  @ApiProperty({ type: [GradeEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => GradeEntryDto)
  entries!: GradeEntryDto[];
}

export class ClosePeriodDto {
  @ApiPropertyOptional({ description: 'Cerrar aunque haya estudiantes sin nota completa' })
  @IsBoolean()
  @IsOptional()
  allowIncomplete?: boolean;
}

export class ReopenPeriodDto {
  @ApiProperty({ example: 'Corrección de notas de Matemática' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;
}

export class SupplementaryEntryDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ example: 7 })
  @IsNumber()
  value!: number;
}

export class RegisterSupplementaryDto {
  @ApiProperty({ type: [SupplementaryEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SupplementaryEntryDto)
  entries!: SupplementaryEntryDto[];
}

export class PromotionDecisionEntryDto {
  @ApiProperty()
  @IsUUID()
  studentEnrollmentId!: string;

  @ApiProperty({ enum: PROMOTION_OUTCOMES })
  @IsIn(PROMOTION_OUTCOMES)
  outcome!: (typeof PROMOTION_OUTCOMES)[number];

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string | null;
}

export class ConfirmPromotionDto {
  @ApiProperty({ type: [PromotionDecisionEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PromotionDecisionEntryDto)
  decisions!: PromotionDecisionEntryDto[];
}
