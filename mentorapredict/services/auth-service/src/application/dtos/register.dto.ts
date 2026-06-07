import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Victor' })
  @IsString() @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Cañar' })
  @IsString() @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'victor@uce.edu.ec' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString() @MinLength(8) @MaxLength(64)
  password!: string;
}
