// Import necessary modules and decorators
import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Student } from './entities/student.entity';
import { Course } from './entities/course.entity';

@Injectable()
export class StudentService {
  addFeedback(id: any, courseId: number, feedback: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    private readonly jwtService: JwtService,
  ) {}

  // Register function
  async register(studentDto: any): Promise<{ message: string }> {
    const { password, ...rest } = studentDto;
  
    // Validate input
    if (!password) {
      throw new BadRequestException('Password is required');
    }
  
    // Check if student email already exists
    const existingStudent = await this.studentRepository.findOne({
      where: { email: studentDto.email },
    });
    if (existingStudent) {
      throw new BadRequestException('Email already exists');
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Create student entity
    const student = this.studentRepository.create({
      ...rest,
      password: hashedPassword,
      totalPayable: 0,
    });
  
    await this.studentRepository.save(student);
    return { message: 'Student registered successfully.' };
  }
  

  // Login function
  async login({ email, password }: { email: string; password: string }): Promise<{ token: string }> {
    const student = await this.studentRepository.findOne({ where: { email } });
    if (!student) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { email: student.email, id: student.id };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async getProfile(studentId: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['courses'],
    });
  
    if (!student) {
      throw new NotFoundException('Student not found');
    }
  
    return student;
  }
  

  // Get all courses
  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  // Select course
  async selectCourse(studentId: number, courseId: number): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id: studentId }, relations: ['courses'] });
    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (student.courses.some((c) => c.id === courseId)) {
      throw new BadRequestException('Course already selected');
    }

    student.courses.push(course);
    student.totalPayable += course.price;
    await this.studentRepository.save(student);

    return { message: 'Course selected successfully' };
  }

  // Remove course
  async removeCourse(studentId: number, courseId: number): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id: studentId }, relations: ['courses'] });
    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!student.courses.some((c) => c.id === courseId)) {
      throw new BadRequestException('Course not found in student selection');
    }

    student.courses = student.courses.filter((c) => c.id !== courseId);
    student.totalPayable -= course.price;
    await this.studentRepository.save(student);

    return { message: 'Course removed successfully' };
  }

  // Update profile
  async editProfile(studentId: number, updateDto: any): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
  
    if (!student) {
      throw new NotFoundException('Student not found');
    }
  
    Object.assign(student, updateDto);
    await this.studentRepository.save(student);
  
    return { message: 'Profile updated successfully' };
  }
  
  

  // Change password
  async changePassword(studentId: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await this.studentRepository.save(student);

    return { message: 'Password changed successfully' };
  }

  // Forget password
  async forgetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { email } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await this.studentRepository.save(student);

    return { message: 'Password reset successfully' };
  }

  // Get course description and feedback
  async getCourseDetails(courseId: number): Promise<{ course: Course; feedbacks: string[] }> {
    const course = await this.courseRepository.findOne({ where: { id: courseId }, relations: ['feedbacks'] });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return { course, feedbacks: course.feedbacks.map((feedback) => feedback.content) };
  }

  // Submit feedback
  async submitFeedback(studentId: number, courseId: number, feedback: string): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    const course = await this.courseRepository.findOne({ where: { id: courseId }, relations: ['feedbacks'] });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.feedbacks) {
      course.feedbacks = [];
    }

    course.feedbacks.push({
      content: feedback, student,
      id: 0,
      course: new Course
    });
    await this.courseRepository.save(course);

    return { message: 'Feedback submitted successfully' };
  }

  // Add course and return total payable
  async addCourse(studentId: number, courseId: number): Promise<any> {
    const student = await this.studentRepository.findOne({ where: { id: studentId }, relations: ['courses'] });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (student.courses.some((existingCourse) => existingCourse.id === course.id)) {
      throw new ConflictException('Course already added to your account');
    }

    student.courses.push(course);
    student.totalPayable += course.price;

    await this.studentRepository.save(student);

    return {
      message: 'Course added successfully',
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
      },
      totalPayable: student.totalPayable,
    };
  }
}
