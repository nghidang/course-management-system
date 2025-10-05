import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Enrollment } from '../../enrollments/schemas/enrollment.schema';

@Injectable()
export class EnrollmentRepository extends BaseRepository<Enrollment> {
  constructor(@InjectModel('Enrollment') model: Model<Enrollment>) {
    super(model);
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return this.model
      .find({ course: new Types.ObjectId(courseId) })
      .populate({ path: 'student', select: 'email' });
  }

  async findByCourses(courseIds: string[]): Promise<Enrollment[]> {
    const objectIds = courseIds.map((id) => new Types.ObjectId(id));
    return this.model
      .find({ course: { $in: objectIds } })
      .populate({ path: 'student', select: 'email' });
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return this.model.findOne({ student: studentId, course: courseId });
  }
}
