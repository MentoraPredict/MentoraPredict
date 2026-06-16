import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeAcademicPeriodStatusDto {
  @ApiProperty({ enum: ['PLANNED', 'ACTIVE', 'FINISHED', 'CANCELLED'] })
  @IsIn(['PLANNED', 'ACTIVE', 'FINISHED', 'CANCELLED'])
  status!: 'PLANNED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
}
