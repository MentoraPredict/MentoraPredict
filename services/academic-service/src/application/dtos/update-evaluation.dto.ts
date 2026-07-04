import { IsString, IsNumber, Min, Max, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEvaluationDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ minimum: 0, maximum: 100, required: false }) @IsOptional() @IsNumber() @Min(0) @Max(100) weight?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?: string;
}
