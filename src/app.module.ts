import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    UsersModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
