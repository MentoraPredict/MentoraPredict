import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCareerDto {
  @ApiPropertyOptional({ example: 'Ingeniería de Sistemas', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'IS', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ example: 'Carrera de Ingeniería de Sistemas y Computación' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 20 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(20)
  durationSemesters?: number;
}
