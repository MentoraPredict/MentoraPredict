import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  REPETITION_POLICIES,
  SHIFTS,
  SUSTENTATIONS,
} from '../../domain/entities/institution-config.entity';

export class UpdateInstitutionDto {
  @ApiPropertyOptional({ example: '17H00001', nullable: true })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  amie?: string | null;

  @ApiProperty({ example: 'Unidad Educativa Ejemplo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ enum: SUSTENTATIONS })
  @IsIn(SUSTENTATIONS)
  sustentation!: (typeof SUSTENTATIONS)[number];

  @ApiProperty({ enum: ['SIERRA_AMAZONIA', 'COSTA_GALAPAGOS'] })
  @IsIn(['SIERRA_AMAZONIA', 'COSTA_GALAPAGOS'])
  regime!: 'SIERRA_AMAZONIA' | 'COSTA_GALAPAGOS';

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  zone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  district?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(300)
  @IsOptional()
  address?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(30)
  @IsOptional()
  phone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  rectorName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  logoUrl?: string | null;
}

export class InstitutionLevelDto {
  @ApiProperty({ example: 'EGB_MEDIA' })
  @IsString()
  @IsNotEmpty()
  levelCode!: string;

  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ enum: SHIFTS, isArray: true })
  @IsArray()
  @IsIn(SHIFTS, { each: true })
  shifts!: (typeof SHIFTS)[number][];
}

export class UpdateInstitutionLevelsDto {
  @ApiProperty({ type: [InstitutionLevelDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => InstitutionLevelDto)
  levels!: InstitutionLevelDto[];
}

export class GradingScaleBandDto {
  @ApiProperty({ example: 'DAR' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiProperty({ example: 'Domina los aprendizajes requeridos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  label!: string;

  @ApiProperty({ example: 9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  minValue!: number;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  maxValue!: number;
}

export class UpdateGradingScaleDto {
  @ApiProperty({ example: 'Escala MINEDUC 0-10' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  minValue!: number;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  maxValue!: number;

  @ApiProperty({ example: 7 })
  @IsNumber({ maxDecimalPlaces: 2 })
  passingGrade!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  @Max(2)
  decimals!: number;

  @ApiProperty({ type: [GradingScaleBandDto] })
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => GradingScaleBandDto)
  bands!: GradingScaleBandDto[];
}

export class UpdateAttendanceRuleDto {
  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  maxUnjustifiedPct!: number;

  @ApiProperty({ example: [5, 8] })
  @IsArray()
  @ArrayMaxSize(5)
  @IsNumber({ maxDecimalPlaces: 2 }, { each: true })
  warningPcts!: number[];

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  appliesFromLevelOrder!: number;

  @ApiPropertyOptional({ nullable: true, example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  justificationDays?: number | null;
}

export class PromotionRuleDto {
  @ApiProperty({ example: 'EGB_MEDIA' })
  @IsString()
  @IsNotEmpty()
  levelCode!: string;

  @ApiProperty({ example: 7 })
  @IsNumber({ maxDecimalPlaces: 2 })
  minAverage!: number;

  @ApiProperty()
  @IsBoolean()
  allowsSupplementary!: boolean;

  @ApiProperty({ example: 4 })
  @IsNumber({ maxDecimalPlaces: 2 })
  supplementaryMinAverage!: number;

  @ApiProperty({ enum: REPETITION_POLICIES })
  @IsIn(REPETITION_POLICIES)
  repetitionPolicy!: (typeof REPETITION_POLICIES)[number];
}

export class UpdatePromotionRulesDto {
  @ApiProperty({ type: [PromotionRuleDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PromotionRuleDto)
  rules!: PromotionRuleDto[];
}
