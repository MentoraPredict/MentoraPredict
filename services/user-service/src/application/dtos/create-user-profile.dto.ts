import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserProfileDto {
  @ApiProperty({ description: 'Same UUID as the user in auth-service' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Cedula number', required: false })
  @IsString()
  @IsOptional()
  cedula?: string;
}
