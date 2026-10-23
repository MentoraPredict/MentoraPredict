import { IsArray, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SurveyAnswerDto {
  @ApiProperty() @IsUUID() questionId!: string;
  // Tipo de valor libre (string/number/boolean/array) — depende del
  // question_type de la pregunta, no se valida su forma acá.
  @ApiProperty() answerValue!: unknown;
}

export class SubmitSurveyResponseDto {
  @ApiProperty({ example: 'SOCIOECONOMIC' })
  @IsString() @IsNotEmpty()
  surveyCode!: string;

  @ApiProperty({ example: 'uuid-of-period' })
  @IsUUID()
  periodId!: string;

  @ApiProperty({ type: [SurveyAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerDto)
  answers!: SurveyAnswerDto[];
}
