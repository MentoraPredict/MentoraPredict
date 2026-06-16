import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeCareerStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsIn(['ACTIVE', 'INACTIVE'])
  status!: 'ACTIVE' | 'INACTIVE';
}
