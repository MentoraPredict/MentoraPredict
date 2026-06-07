import { IsUUID, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordGradeDto {
  @ApiProperty() @IsUUID() studentId!: string;
  @ApiProperty() @IsUUID() evaluationId!: string;
  @ApiProperty({ minimum: 0, maximum: 10 })
  @IsNumber() @Min(0) @Max(10)
  value!: number;
}
