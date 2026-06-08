import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollStudentDto {
  @ApiProperty() @IsUUID() studentId!: string;
  @ApiProperty() @IsUUID() subjectId!: string;
}
