import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollDto {
  @ApiProperty()
  @IsString()
  courseId: string;
}
