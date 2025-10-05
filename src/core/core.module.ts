import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/schemas/user.schema';
import { CourseSchema } from '../courses/schemas/course.schema';
import { EnrollmentSchema } from '../enrollments/schemas/enrollment.schema';
import { UserRepository } from './repositories/user.repository';
import { CourseRepository } from './repositories/course.repository';
import { EnrollmentRepository } from './repositories/enrollment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Course', schema: CourseSchema },
      { name: 'Enrollment', schema: EnrollmentSchema },
    ]),
  ],
  providers: [UserRepository, CourseRepository, EnrollmentRepository],
  exports: [UserRepository, CourseRepository, EnrollmentRepository],
})
export class CoreModule {}
