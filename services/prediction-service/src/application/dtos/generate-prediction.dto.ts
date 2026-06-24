import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePredictionParamsDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty()
  @IsUUID()
  periodId!: string;
}
