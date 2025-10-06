import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';

type Req = {
  user: {
    sub: string;
  };
};

@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @SetMetadata('roles', ['Student'])
  @ApiBearerAuth()
  @Post()
  async enroll(@Body() dto: EnrollDto, @Request() req: Req) {
    return this.enrollmentsService.enroll(dto.courseId, req.user.sub);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @SetMetadata('roles', ['Instructor'])
  @ApiBearerAuth()
  @Get(':courseId/students')
  async getStudents(@Param('courseId') courseId: string, @Request() req: Req) {
    return this.enrollmentsService.getStudents(courseId, req.user.sub);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @SetMetadata('roles', ['Instructor'])
  @ApiBearerAuth()
  @Get('students')
  async getStudentsWithoutCourseId(@Request() req: Req) {
    return this.enrollmentsService.getStudents(null, req.user.sub);
  }
}
