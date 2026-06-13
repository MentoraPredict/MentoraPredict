import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTeacherDto {
  @ApiProperty() @IsUUID() subjectId!: string;
  @ApiProperty() @IsUUID() teacherId!: string;
  @ApiProperty() @IsUUID() periodId!: string;
}
