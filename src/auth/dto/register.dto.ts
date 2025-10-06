import { IsEmail, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ enum: ['Student', 'Instructor', 'Admin'] })
  @IsEnum(['Student', 'Instructor', 'Admin'])
  role: 'Student' | 'Instructor' | 'Admin';
}
