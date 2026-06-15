import { IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ComplianceInputDto {
  @ApiProperty() @IsNumber() @Min(0) @Max(100) asistencia!: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) tareas!: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) evaluaciones!: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) participacion!: number;
}
