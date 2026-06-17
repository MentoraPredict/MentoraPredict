import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFacultyDto {
  @ApiPropertyOptional({ example: 'Facultad de Ingeniería', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'FI', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ example: 'Facultad de Ingeniería y Tecnología' })
  @IsString()
  @IsOptional()
  description?: string;
}
