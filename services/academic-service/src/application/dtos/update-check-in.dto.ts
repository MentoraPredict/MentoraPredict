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
import { TopicResponseDto } from './create-check-in.dto';

const EMOTIONAL_STATES: EmotionalState[] = ['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'CRITICAL'];

export class UpdateCheckInDto {
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() attendance?: boolean;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  taskCompletion?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  studyHours?: number;

  @ApiProperty({ required: false, enum: EMOTIONAL_STATES })
  @IsOptional()
  @IsEnum(EMOTIONAL_STATES)
  emotionalState?: EmotionalState;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  generalComprehension?: number;

  @ApiProperty({ type: [TopicResponseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicResponseDto)
  topicResponses?: TopicResponseDto[];

  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
