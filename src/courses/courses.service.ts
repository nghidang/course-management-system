import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CourseRepository } from '../core/repositories/course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepo: CourseRepository) {}

  async create(dto: CreateCourseDto, instructorId: string) {
    const course = await this.courseRepo.create({
      ...dto,
      instructor: new Types.ObjectId(instructorId),
    });
    return course;
  }

  async findAll() {
    const courses = await this.courseRepo.findAll();
    return courses;
  }

  async findOne(id: string) {
    const course = await this.courseRepo.findById(id);
    if (!course) throw new NotFoundException();
    return course;
  }

  async update(id: string, dto: UpdateCourseDto, instructorId: string) {
    const course = await this.courseRepo.findById(id);
    if (course?.instructor.toString() !== instructorId)
      throw new ForbiddenException();
    const updated = await this.courseRepo.update(id, dto);
    return updated;
  }

  async delete(id: string, userId: string, role: string) {
    const course = await this.courseRepo.findById(id);
    if (role !== 'Admin' && course?.instructor.toString() !== userId)
      throw new ForbiddenException();
    await this.courseRepo.delete(id);
    return { message: 'Course deleted' };
  }
}
