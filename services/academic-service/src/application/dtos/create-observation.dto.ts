import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObservationType } from '../../domain/entities/teacher-observation.entity';

export class CreateObservationDto {
  @ApiProperty() @IsUUID() studentId!: string;
  @ApiProperty() @IsUUID() teacherId!: string;
  @ApiProperty() @IsUUID() subjectId!: string;
  @ApiProperty({ enum: ObservationType })
  @IsEnum(ObservationType)
  type!: ObservationType;
  @ApiProperty() @IsString() @MinLength(3) content!: string;
}
