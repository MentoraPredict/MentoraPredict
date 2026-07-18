import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Dos formas válidas de crear una oferta (ver
// docs/database/database-update-plan.md §5.1 y create-subject.use-case.ts):
// 1. Reofertar una materia ya existente en el catálogo -> solo `subjectCatalogId`.
// 2. Ofertar una materia nueva -> `name`/`code`/`credits`/`careerId`, que
//    crean la fila de catálogo de una vez (mismo comportamiento que antes
//    de separar catálogo/oferta, para no romper a los llamadores actuales).
export class CreateSubjectDto {
  @ApiPropertyOptional({
    example: 'uuid-of-subject-catalog',
    description: 'Reofertar una materia ya existente en el catálogo. Si se envía, el resto de los campos de catálogo (name/code/credits/careerId) se ignoran.',
  })
  @IsUUID()
  @IsOptional()
  subjectCatalogId?: string;

  @ApiPropertyOptional({ example: 'Programación Web', maxLength: 200 })
  @ValidateIf((o: CreateSubjectDto) => !o.subjectCatalogId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'PW-701', maxLength: 20 })
  @ValidateIf((o: CreateSubjectDto) => !o.subjectCatalogId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ example: 'Desarrollo de aplicaciones web modernas' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 10 })
  @ValidateIf((o: CreateSubjectDto) => !o.subjectCatalogId)
  @IsInt()
  @Min(1)
  @Max(10)
  credits?: number;

  @ApiPropertyOptional({ example: 'uuid-of-career' })
  @ValidateIf((o: CreateSubjectDto) => !o.subjectCatalogId)
  @IsUUID()
  @IsNotEmpty()
  careerId?: string;

  @ApiPropertyOptional({ example: 30, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;

  @ApiPropertyOptional({
    example: 'uuid-of-teacher',
    description:
      'Required when an ADMIN creates the course (assigns the real teacher). Ignored for TEACHER callers — their own id from the JWT is always used.',
  })
  @IsUUID()
  @IsOptional()
  teacherId?: string;
}
