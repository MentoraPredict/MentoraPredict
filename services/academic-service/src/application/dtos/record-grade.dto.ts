import { IsUUID, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordGradeDto {
  @ApiProperty() @IsUUID() studentId!: string;
  @ApiProperty() @IsUUID() evaluationId!: string;
  @ApiProperty({ minimum: 0, maximum: 20 })
  @IsNumber() @Min(0) @Max(20)
  value!: number;
}
