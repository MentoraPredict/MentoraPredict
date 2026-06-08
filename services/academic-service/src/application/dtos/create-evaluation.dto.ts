import { IsString, IsUUID, IsNumber, Min, Max, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluationDto {
  @ApiProperty({ example: 'Parcial 1' }) @IsString() name!: string;
  @ApiProperty({ minimum: 0, maximum: 100 }) @IsNumber() @Min(0) @Max(100) weight!: number;
  @ApiProperty() @IsUUID() subjectId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?: string;
}
