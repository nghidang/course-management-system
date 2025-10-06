import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';

type Req = {
  user: {
    sub: string;
    role: string;
  };
};

@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @SetMetadata('roles', ['Instructor'])
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateCourseDto, @Request() req: Req) {
    return this.coursesService.create(dto, req.user.sub);
  }

  @Get()
  async findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @SetMetadata('roles', ['Instructor'])
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @Request() req: Req,
  ) {
    return this.coursesService.update(id, dto, req.user.sub);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @SetMetadata('roles', ['Instructor', 'Admin'])
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: Req) {
    return this.coursesService.delete(id, req.user.sub, req.user.role);
  }
}
