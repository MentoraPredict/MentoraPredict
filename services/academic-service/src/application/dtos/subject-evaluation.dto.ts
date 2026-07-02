import { IsString, IsNumber, Min, Max, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubjectEvaluationDto {
  @ApiProperty({ example: 'Parcial 1' }) @IsString() name!: string;
  @ApiProperty({ minimum: 0, maximum: 100 }) @IsNumber() @Min(0) @Max(100) weight!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?: string;
}
