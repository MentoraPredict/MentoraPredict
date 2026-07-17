import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const VALID_STATUSES = ['ACTIVE', 'WITHDRAWN', 'COMPLETED', 'SUSPENDED'] as const;

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ enum: VALID_STATUSES })
  @IsIn(VALID_STATUSES)
  status!: (typeof VALID_STATUSES)[number];
}
