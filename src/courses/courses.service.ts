import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Course } from './schemas/course.schema';
import { CourseRepository } from '../core/repositories/course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepo: CourseRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateCourseDto, instructorId: string) {
    const course = await this.courseRepo.create({
      ...dto,
      instructor: new Types.ObjectId(instructorId),
    });
    await this.cacheManager.del('courses');
    return course;
  }

  async findAll() {
    let courses = await this.cacheManager.get<Course[]>('courses');
    if (!courses) {
      courses = await this.courseRepo.findAll();
      await this.cacheManager.set('courses', courses, 300);
    }
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
    await this.cacheManager.del('courses');
    return updated;
  }

  async delete(id: string, userId: string, role: string) {
    const course = await this.courseRepo.findById(id);
    if (role !== 'Admin' && course?.instructor.toString() !== userId)
      throw new ForbiddenException();
    await this.courseRepo.delete(id);
    await this.cacheManager.del('courses');
    return { message: 'Course deleted' };
  }
}
