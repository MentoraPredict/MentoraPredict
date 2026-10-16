import { ArrayMinSize, IsArray, IsIn, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const DAY_VALUES = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ClassScheduleSlotDto {
  @ApiProperty({ enum: DAY_VALUES }) @IsIn(DAY_VALUES) dayOfWeek!: string;
  @ApiProperty({ example: '08:00' }) @IsString() @Matches(TIME_PATTERN) startTime!: string;
  @ApiProperty({ example: '10:00' }) @IsString() @Matches(TIME_PATTERN) endTime!: string;
}

export class DefineSubjectScheduleDto {
  @ApiProperty({ type: [ClassScheduleSlotDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ClassScheduleSlotDto)
  slots!: ClassScheduleSlotDto[];
}
