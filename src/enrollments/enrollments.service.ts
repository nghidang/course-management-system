import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EnrollmentRepository } from '../core/repositories/enrollment.repository';
import { CourseRepository } from '../core/repositories/course.repository';
import { Enrollment } from './schemas/enrollment.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly courseRepo: CourseRepository,
  ) {}

  async enroll(courseId: string, studentId: string) {
    const existing = await this.enrollmentRepo.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (existing) throw new BadRequestException('Already enrolled');

    const enrollment = await this.enrollmentRepo.create({
      student: new Types.ObjectId(studentId),
      course: new Types.ObjectId(courseId),
    });
    return enrollment;
  }

  async getStudents(courseId: string | null, instructorId: string) {
    let enrollments: Enrollment[] = [];

    if (courseId) {
      const course = await this.courseRepo.findById(courseId);
      if (course?.instructor.toString() !== instructorId)
        throw new ForbiddenException();
      enrollments = await this.enrollmentRepo.findByCourse(courseId);
    } else {
      const courses = await this.courseRepo.findByInstructor(instructorId);
      const courseIds = courses.map((course) =>
        (course as { _id: string })._id.toString(),
      );
      enrollments = await this.enrollmentRepo.findByCourses(courseIds);
    }

    return enrollments.map((enrollment) => ({
      student: enrollment.student,
      course: enrollment.course,
    }));
  }
}
