import { IsString, IsNotEmpty, IsOptional, IsIn, IsArray, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const QUESTION_TYPES = ['SINGLE_CHOICE', 'MULTI_CHOICE', 'NUMBER', 'TEXT', 'BOOLEAN'];

export class CreateSurveyQuestionDto {
  @ApiProperty({ example: 'SOCIO_FAMILY_INCOME', maxLength: 50 })
  @IsString() @IsNotEmpty() @MaxLength(50)
  code!: string;

  @ApiProperty({ example: 'SOCIOECONOMIC', maxLength: 50 })
  @IsString() @IsNotEmpty() @MaxLength(50)
  category!: string;

  @ApiProperty({ example: '¿Cuál es el ingreso mensual aproximado de tu hogar?' })
  @IsString() @IsNotEmpty()
  questionText!: string;

  @ApiProperty({ enum: QUESTION_TYPES })
  @IsIn(QUESTION_TYPES)
  questionType!: string;

  @ApiPropertyOptional({ type: [String], example: ['Menos de $460', '$460 - $920', 'Más de $920'] })
  @IsOptional() @IsArray()
  options?: string[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsInt() @Min(0)
  order?: number;
}
