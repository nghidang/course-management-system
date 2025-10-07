import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoreModule } from '../core/core.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CoreModule, CacheModule.register()],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
