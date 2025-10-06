import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
