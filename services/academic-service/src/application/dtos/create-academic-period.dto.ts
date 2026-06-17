import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicPeriodDto {
  @ApiProperty({ example: '2025-I', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: '2025-1', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({ example: 'Primer semestre del año 2025' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-02-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2025-06-30' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ enum: ['SEMESTER', 'QUARTER'] })
  @IsIn(['SEMESTER', 'QUARTER'])
  type!: 'SEMESTER' | 'QUARTER';
}
