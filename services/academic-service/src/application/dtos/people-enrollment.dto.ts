import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CONSENT_PURPOSES,
  GUARDIAN_RELATIONS,
  SEX_VALUES,
} from '../../domain/entities/people.entity';

export class UpsertStudentProfileDto {
  @ApiPropertyOptional({ example: '2012-05-10', nullable: true })
  @IsDateString()
  @IsOptional()
  birthDate?: string | null;

  @ApiPropertyOptional({ enum: SEX_VALUES, nullable: true })
  @IsIn(SEX_VALUES)
  @IsOptional()
  sex?: (typeof SEX_VALUES)[number] | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(60)
  @IsOptional()
  nationality?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(300)
  @IsOptional()
  address?: string | null;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasSpecialNeeds?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  specialNeedsNotes?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  emergencyContactName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(30)
  @IsOptional()
  emergencyContactPhone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  previousSchool?: string | null;
}

export class LinkGuardianDto {
  @ApiProperty()
  @IsUUID()
  guardianId!: string;

  @ApiProperty({ enum: GUARDIAN_RELATIONS })
  @IsIn(GUARDIAN_RELATIONS)
  relation!: (typeof GUARDIAN_RELATIONS)[number];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  canPickup?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  livesWith?: boolean;
}

export class GrantConsentDto {
  @ApiProperty({ enum: CONSENT_PURPOSES })
  @IsIn(CONSENT_PURPOSES)
  purpose!: (typeof CONSENT_PURPOSES)[number];

  @ApiPropertyOptional({ example: 'v1' })
  @IsString()
  @MaxLength(30)
  @IsOptional()
  noticeVersion?: string;
}

export class EnrollStudentsDto {
  @ApiProperty({ type: [String], description: 'Estudiantes a matricular en el paralelo' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  studentIds!: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class EndStudentEnrollmentDto {
  @ApiProperty({ enum: ['WITHDRAWN', 'TRANSFERRED'] })
  @IsIn(['WITHDRAWN', 'TRANSFERRED'])
  status!: 'WITHDRAWN' | 'TRANSFERRED';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
