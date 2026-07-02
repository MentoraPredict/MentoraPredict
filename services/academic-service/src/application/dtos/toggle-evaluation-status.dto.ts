import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleEvaluationStatusDto {
  @ApiProperty({ description: 'true = active, false = archived' }) @IsBoolean() isActive!: boolean;
}
