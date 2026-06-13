import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'student@uce.edu.ec' })
  @IsEmail()
  email!: string;
}
