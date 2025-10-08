import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { CoreModule } from '../core/core.module';
import { EnrollmentConsumer } from './enrollments.consumer';

@Module({
  imports: [
    CoreModule,
    BullModule.registerQueue({
      name: 'enrollment',
    }),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentConsumer],
})
export class EnrollmentsModule {}
