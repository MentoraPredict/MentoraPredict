import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Programación Web', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'PW-701', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({ example: 'Desarrollo de aplicaciones web modernas' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  credits!: number;

  @ApiProperty({ example: 'uuid-of-career' })
  @IsUUID()
  @IsNotEmpty()
  careerId!: string;

  @ApiPropertyOptional({ example: 30, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;
}
