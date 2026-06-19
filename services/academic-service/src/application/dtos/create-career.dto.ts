import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCareerDto {
  @ApiProperty({ example: 'Ingeniería de Sistemas', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'IS', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({ example: 'Carrera de Ingeniería de Sistemas y Computación' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-of-faculty' })
  @IsUUID()
  @IsNotEmpty()
  facultyId!: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  durationSemesters!: number;
}
