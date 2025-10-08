import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../../src/courses/courses.service';
import { CourseRepository } from '../../src/core/repositories/course.repository';
import { CreateCourseDto } from '../../src/courses/dto/create-course.dto';
import { UpdateCourseDto } from '../../src/courses/dto/update-course.dto';

describe('CoursesService', () => {
  let service: CoursesService;
  // let courseRepo: CourseRepository;
  // let cacheManager: any;

  const mockCourseRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: CourseRepository, useValue: mockCourseRepo },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    // courseRepo = module.get<CourseRepository>(CourseRepository);
    // cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a course and clear cache', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'A test course description',
      };
      const instructorId = '68e59cda34df39de0a6d824e';
      const createdCourse = {
        _id: new Types.ObjectId(),
        title: createCourseDto.title,
        description: createCourseDto.description,
        instructor: new Types.ObjectId(instructorId),
      };

      mockCourseRepo.create.mockResolvedValue(createdCourse);
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.create(createCourseDto, instructorId);

      expect(mockCourseRepo.create).toHaveBeenCalledWith({
        ...createCourseDto,
        instructor: new Types.ObjectId(instructorId),
      });
      expect(mockCacheManager.del).toHaveBeenCalledWith('courses');
      expect(result).toEqual(createdCourse);
    });

    it('should throw BadRequestException if instructorId is invalid', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'A test course description',
      };
      const invalidInstructorId = 'invalid-id';

      await expect(
        service.create(createCourseDto, invalidInstructorId),
      ).rejects.toThrow(
        'input must be a 24 character hex string, 12 byte Uint8Array, or an integer',
      );
    });
  });

  describe('findAll', () => {
    it('should return courses from cache if available', async () => {
      const courses = [
        {
          _id: new Types.ObjectId(),
          title: 'Test Course',
          description: 'A test course description',
          instructor: new Types.ObjectId(),
        },
      ];

      mockCacheManager.get.mockResolvedValue(courses);

      const result = await service.findAll();

      expect(mockCacheManager.get).toHaveBeenCalledWith('courses');
      expect(mockCourseRepo.findAll).not.toHaveBeenCalled();
      expect(mockCacheManager.set).not.toHaveBeenCalled();
      expect(result).toEqual(courses);
    });

    it('should fetch from repo and set cache if not cached', async () => {
      const courses = [
        {
          _id: new Types.ObjectId(),
          title: 'Test Course',
          description: 'A test course description',
          instructor: new Types.ObjectId(),
        },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockCourseRepo.findAll.mockResolvedValue(courses);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAll();

      expect(mockCacheManager.get).toHaveBeenCalledWith('courses');
      expect(mockCourseRepo.findAll).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'courses',
        courses,
        300,
      );
      expect(result).toEqual(courses);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const course = {
        _id: new Types.ObjectId(courseId),
        title: 'Test Course',
        description: 'A test course description',
        instructor: new Types.ObjectId(),
      };

      mockCourseRepo.findById.mockResolvedValue(course);

      const result = await service.findOne(courseId);

      expect(mockCourseRepo.findById).toHaveBeenCalledWith(courseId);
      expect(result).toEqual(course);
    });

    it('should throw NotFoundException if course not found', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      mockCourseRepo.findById.mockResolvedValue(null);

      await expect(service.findOne(courseId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a course and clear cache', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const instructorId = '68e59cda34df39de0a6d824f';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Updated description',
      };
      const course = {
        _id: new Types.ObjectId(courseId),
        title: 'Test Course',
        description: 'A test course description',
        instructor: new Types.ObjectId(instructorId),
      };
      const updatedCourse = {
        ...course,
        ...updateCourseDto,
      };

      mockCourseRepo.findById.mockResolvedValue(course);
      mockCourseRepo.update.mockResolvedValue(updatedCourse);
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.update(
        courseId,
        updateCourseDto,
        instructorId,
      );

      expect(mockCourseRepo.findById).toHaveBeenCalledWith(courseId);
      expect(mockCourseRepo.update).toHaveBeenCalledWith(
        courseId,
        updateCourseDto,
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith('courses');
      expect(result).toEqual(updatedCourse);
    });

    it('should throw ForbiddenException if user is not instructor', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const instructorId = '68e59cda34df39de0a6d824f';
      const wrongInstructorId = '68e59cda34df39de0a6d8250';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Updated description',
      };
      const course = {
        _id: new Types.ObjectId(courseId),
        title: 'Test Course',
        description: 'A test course description',
        instructor: new Types.ObjectId(instructorId),
      };

      mockCourseRepo.findById.mockResolvedValue(course);

      await expect(
        service.update(courseId, updateCourseDto, wrongInstructorId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if course not found', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const instructorId = '68e59cda34df39de0a6d824f';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Updated description',
      };

      mockCourseRepo.findById.mockResolvedValue(null);

      await expect(
        service.update(courseId, updateCourseDto, instructorId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a course and clear cache if user is instructor', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const instructorId = '68e59cda34df39de0a6d824f';
      const course = {
        _id: new Types.ObjectId(courseId),
        title: 'Test Course',
        description: 'A test course description',
        instructor: new Types.ObjectId(instructorId),
      };

      mockCourseRepo.findById.mockResolvedValue(course);
      mockCourseRepo.delete.mockResolvedValue(undefined);
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.delete(courseId, instructorId, 'Instructor');

      expect(mockCourseRepo.findById).toHaveBeenCalledWith(courseId);
      expect(mockCourseRepo.delete).toHaveBeenCalledWith(courseId);
      expect(mockCacheManager.del).toHaveBeenCalledWith('courses');
      expect(result).toEqual({ message: 'Course deleted' });
    });

    it('should delete a course if user is Admin', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const userId = '68e59cda34df39de0a6d8250';
      const course = {
        _id: new Types.ObjectId(courseId),
        title: 'Test Course',
        description: 'A test course description',
        instructor: new Types.ObjectId('68e59cda34df39de0a6d824f'),
      };

      mockCourseRepo.findById.mockResolvedValue(course);
      mockCourseRepo.delete.mockResolvedValue(undefined);
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.delete(courseId, userId, 'Admin');

      expect(mockCourseRepo.findById).toHaveBeenCalledWith(courseId);
      expect(mockCourseRepo.delete).toHaveBeenCalledWith(courseId);
      expect(mockCacheManager.del).toHaveBeenCalledWith('courses');
      expect(result).toEqual({ message: 'Course deleted' });
    });

    it('should throw ForbiddenException if user is not instructor or Admin', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const userId = '68e59cda34df39de0a6d8250';
      const course = {
        _id: new Types.ObjectId(courseId),
        title: 'Test Course',
        description: 'A test course description',
        instructor: new Types.ObjectId('68e59cda34df39de0a6d824f'),
      };

      mockCourseRepo.findById.mockResolvedValue(course);

      await expect(service.delete(courseId, userId, 'Student')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if course not found', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const userId = '68e59cda34df39de0a6d824f';

      mockCourseRepo.findById.mockResolvedValue(null);

      await expect(
        service.delete(courseId, userId, 'Instructor'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
