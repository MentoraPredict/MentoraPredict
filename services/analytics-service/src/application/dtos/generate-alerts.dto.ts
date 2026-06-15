import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateAlertsDto {
  @ApiProperty() @IsString() riskLevel!: string;
  @ApiProperty() @IsNumber() @Min(0) @Max(10) currentAverage!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() previousAverage?: number;
  @ApiProperty() @IsNumber() @Min(0) failedEvaluations!: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) attendance!: number;
}
