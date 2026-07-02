import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmotionalState } from '../../domain/entities/weekly-check-in.entity';

const EMOTIONAL_STATES: EmotionalState[] = ['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'CRITICAL'];

export class TopicResponseDto {
  @ApiProperty() @IsString() topicId!: string;
  @ApiProperty({ minimum: 0, maximum: 100 }) @IsInt() @Min(0) @Max(100) comprehension!: number;
}

export class CreateCheckInDto {
  @ApiProperty() @IsBoolean() attendance!: boolean;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  taskCompletion!: number;

  @ApiProperty({ minimum: 0 }) @IsNumber() @Min(0) studyHours!: number;

  @ApiProperty({ enum: EMOTIONAL_STATES })
  @IsEnum(EMOTIONAL_STATES)
  emotionalState!: EmotionalState;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  generalComprehension!: number;

  @ApiProperty({ type: [TopicResponseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicResponseDto)
  topicResponses?: TopicResponseDto[];

  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
