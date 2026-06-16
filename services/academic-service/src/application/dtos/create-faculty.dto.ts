import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFacultyDto {
  @ApiProperty({ example: 'Facultad de Ingeniería', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'FI', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({ example: 'Facultad de Ingeniería y Tecnología' })
  @IsString()
  @IsOptional()
  description?: string;
}
