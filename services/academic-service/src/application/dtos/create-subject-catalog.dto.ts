import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectCatalogDto {
  @ApiProperty({ example: 'Programación Web', maxLength: 200 })
  @IsString() @IsNotEmpty() @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'PW-701', maxLength: 20 })
  @IsString() @IsNotEmpty() @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({ example: 'Desarrollo de aplicaciones web modernas' })
  @IsString() @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Matemática', maxLength: 50 })
  @IsString() @MaxLength(50) @IsOptional()
  area?: string;
}
