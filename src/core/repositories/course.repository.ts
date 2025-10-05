import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Course } from '../../courses/schemas/course.schema';

@Injectable()
export class CourseRepository extends BaseRepository<Course> {
  constructor(@InjectModel('Course') model: Model<Course>) {
    super(model);
  }

  async findByInstructor(instructorId: string): Promise<Course[]> {
    return this.model.find({ instructor: new Types.ObjectId(instructorId) });
  }
}
