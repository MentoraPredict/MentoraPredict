import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'WITHDRAWN'] })
  @IsIn(['ACTIVE', 'WITHDRAWN'])
  status!: 'ACTIVE' | 'WITHDRAWN';
}
