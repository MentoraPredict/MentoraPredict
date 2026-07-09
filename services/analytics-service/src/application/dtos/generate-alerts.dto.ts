import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateAlertsDto {
  @ApiProperty() @IsUUID() subjectId!: string;
  @ApiProperty() @IsString() riskLevel!: string;
  @ApiProperty() @IsNumber() @Min(0) @Max(20) currentAverage!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() previousAverage?: number;
  @ApiProperty() @IsNumber() @Min(0) failedEvaluations!: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) attendance!: number;
}
