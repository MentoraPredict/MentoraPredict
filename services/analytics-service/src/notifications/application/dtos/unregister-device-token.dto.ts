import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnregisterDeviceTokenDto {
  @ApiProperty() @IsString() @IsNotEmpty() expoPushToken!: string;
}
