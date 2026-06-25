import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  AuthProvider,
  UserProfileStatus,
} from "../../domain/entities/user-profile.entity";

export class UpdateUserDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  photo?: string | null;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  cedula?: string | null;

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

export class UpdateUserProfileDto extends UpdateUserDto {}
