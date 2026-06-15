import { IsNumber, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterGradeDto {
  @ApiProperty() @IsUUID() studentId!: string;
  @ApiProperty() @IsUUID() subjectId!: string;
  @ApiProperty({ minimum: 0, maximum: 10 }) @IsNumber() @Min(0) @Max(10) grade!: number;
}
