import { IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGradeDto {
  @ApiProperty({ minimum: 0, maximum: 20 }) @IsNumber() @Min(0) @Max(20) grade!: number;
}
