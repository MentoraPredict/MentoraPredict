import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateTopicDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(1) title?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false, minimum: 0 }) @IsOptional() @IsInt() @Min(0) order?: number;
}
