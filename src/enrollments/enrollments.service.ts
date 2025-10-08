import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { EnrollmentRepository } from '../core/repositories/enrollment.repository';
import { CourseRepository } from '../core/repositories/course.repository';
import { Enrollment } from './schemas/enrollment.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly courseRepo: CourseRepository,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue('enrollment') private readonly enrollmentQueue: Queue,
  ) {
    this.eventEmitter.on('enrollment.created', (data) => {
      console.log('Event received:', data);
      this.enrollmentQueue.add('sendEmail', data).catch((err) => {
        console.error('Failed to add sendEmail job:', err);
      });
    });
  }

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
    this.eventEmitter.emit('enrollment.created', {
      studentId,
      courseId,
    });
    return enrollment;
  }

  async getStudents(courseId: string | null, instructorId: string) {
    let enrollments: Enrollment[] = [];

    if (courseId) {
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException('Invalid courseId format');
      }

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
