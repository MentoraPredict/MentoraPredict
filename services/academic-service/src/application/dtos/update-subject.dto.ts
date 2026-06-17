import { IsString, IsOptional, IsUUID, IsInt, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubjectDto {
  @ApiPropertyOptional({ example: 'Programación Web', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Desarrollo de aplicaciones web modernas' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsInt()
  @IsOptional()
  @Min(1)
  credits?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsInt()
  @IsOptional()
  @Min(1)
  maxCapacity?: number;

  @ApiPropertyOptional({ example: 'uuid-of-teacher' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;
}
