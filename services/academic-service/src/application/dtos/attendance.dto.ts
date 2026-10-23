import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestJustificationDto {
  @ApiProperty()
  @IsUUID()
  sessionId!: string;

  @ApiProperty({ example: 'Cita médica con certificado' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;
}

export class ResolveJustificationDto {
  @ApiProperty({ description: 'true aprueba la justificación, false la rechaza' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string | null;
}
