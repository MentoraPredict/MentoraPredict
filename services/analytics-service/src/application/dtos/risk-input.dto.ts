import { IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RiskInputDto {
  @ApiProperty() @IsNumber() @Min(0) @Max(10) globalAverage!: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) complianceIndex!: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) attendance!: number;
  @ApiProperty() @IsNumber() @Min(0) failedEvaluations!: number;
  @ApiProperty() @IsNumber() trendSlope!: number;
  @ApiProperty() @IsNumber() @Min(0) studyHours!: number;
}
