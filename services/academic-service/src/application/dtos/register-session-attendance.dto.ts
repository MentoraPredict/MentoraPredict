import { IsArray, IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SessionAttendanceRecordDto {
  @ApiProperty() @IsUUID() studentId!: string;
  @ApiProperty() @IsBoolean() present!: boolean;
}

export class RegisterSessionAttendanceDto {
  @ApiProperty({ type: [SessionAttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionAttendanceRecordDto)
  records!: SessionAttendanceRecordDto[];
}
