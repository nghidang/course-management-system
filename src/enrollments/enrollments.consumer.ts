import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('enrollment')
export class EnrollmentConsumer extends WorkerHost {
  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'sendEmail':
        console.log('Send email for enrollment:', job.data);
    }
  }
}
