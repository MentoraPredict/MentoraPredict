import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider, UserProfileStatus } from '../../domain/entities/user-profile.entity';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cedula?: string;

  @ApiPropertyOptional({ enum: AuthProvider })
  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ enum: UserProfileStatus })
  @IsOptional()
  @IsEnum(UserProfileStatus)
  status?: UserProfileStatus;
}
