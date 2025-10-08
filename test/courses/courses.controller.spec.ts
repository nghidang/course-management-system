import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from '../../src/courses/courses.controller';
import { CoursesService } from '../../src/courses/courses.service';
import { CreateCourseDto } from '../../src/courses/dto/create-course.dto';
import { UpdateCourseDto } from '../../src/courses/dto/update-course.dto';
import { AuthGuard } from '../../src/common/guards/auth.guard';
import { RoleGuard } from '../../src/common/guards/role.guard';

describe('CoursesController', () => {
  let controller: CoursesController;
  // let service: CoursesService;

  const mockCoursesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: mockCoursesService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: RoleGuard, useValue: { canActivate: jest.fn(() => true) } },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    // service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a course and return it wrapped in data', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'A test course description',
      };
      const user = { sub: '68e59cda34df39de0a6d824e', role: 'Instructor' };
      const createdCourse = {
        _id: new Types.ObjectId(),
        title: createCourseDto.title,
        description: createCourseDto.description,
        instructor: new Types.ObjectId(user.sub),
      };

      mockCoursesService.create.mockResolvedValue(createdCourse);

      const result = await controller.create(createCourseDto, { user });

      expect(mockCoursesService.create).toHaveBeenCalledWith(
        createCourseDto,
        user.sub,
      );
      expect(result).toEqual(createdCourse);
    });
  });

  describe('findAll', () => {
    it('should return all courses wrapped in data', async () => {
      const courses = [
        {
          _id: new Types.ObjectId(),
          title: 'Test Course',
          description: 'A test course description',
          instructor: new Types.ObjectId(),
        },
      ];

      mockCoursesService.findAll.mockResolvedValue(courses);

      const result = await controller.findAll();

      expect(mockCoursesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(courses);
    });
  });

  describe('findOne', () => {
    it('should return a course by id wrapped in data', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const course = {
        _id: new Types.ObjectId(courseId),
        title: 'Test Course',
        description: 'A test course description',
        instructor: new Types.ObjectId(),
      };

      mockCoursesService.findOne.mockResolvedValue(course);

      const result = await controller.findOne(courseId);

      expect(mockCoursesService.findOne).toHaveBeenCalledWith(courseId);
      expect(result).toEqual(course);
    });

    it('should throw NotFoundException if course not found', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      mockCoursesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(courseId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a course and return it wrapped in data', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Updated description',
      };
      const user = { sub: '68e59cda34df39de0a6d824f', role: 'Instructor' };
      const updatedCourse = {
        _id: new Types.ObjectId(courseId),
        title: updateCourseDto.title,
        description: updateCourseDto.description,
        instructor: new Types.ObjectId(user.sub),
      };

      mockCoursesService.update.mockResolvedValue(updatedCourse);

      const result = await controller.update(courseId, updateCourseDto, {
        user,
      });

      expect(mockCoursesService.update).toHaveBeenCalledWith(
        courseId,
        updateCourseDto,
        user.sub,
      );
      expect(result).toEqual(updatedCourse);
    });

    it('should throw ForbiddenException if user is not instructor', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Updated description',
      };
      const user = { sub: '68e59cda34df39de0a6d824f', role: 'Instructor' };

      mockCoursesService.update.mockRejectedValue(new ForbiddenException());

      await expect(
        controller.update(courseId, updateCourseDto, { user }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a course and return message wrapped in data', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const user = { sub: '68e59cda34df39de0a6d824f', role: 'Instructor' };
      const deleteResult = { message: 'Course deleted' };

      mockCoursesService.delete.mockResolvedValue(deleteResult);

      const result = await controller.delete(courseId, { user });

      expect(mockCoursesService.delete).toHaveBeenCalledWith(
        courseId,
        user.sub,
        user.role,
      );
      expect(result).toEqual(deleteResult);
    });

    it('should throw ForbiddenException if user is not instructor or Admin', async () => {
      const courseId = '68e59cda34df39de0a6d824e';
      const user = { sub: '68e59cda34df39de0a6d824f', role: 'Student' };

      mockCoursesService.delete.mockRejectedValue(new ForbiddenException());

      await expect(controller.delete(courseId, { user })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
