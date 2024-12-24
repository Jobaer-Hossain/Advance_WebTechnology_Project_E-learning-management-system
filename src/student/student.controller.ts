import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // Registration
  @Post('register')
  async register(@Body() studentDto: any) {
    return this.studentService.register(studentDto);
  }

  // Login
  @Post('login')
  async login(@Body() credentials: { email: string; password: string }) {
    return this.studentService.login(credentials);
  }

  // Protected route - view profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.studentService.getProfile(req.user.id);
  }

  // Update Profile
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req, @Body() updateDto: any) {
    return this.studentService.editProfile(req.user.id, updateDto);
  }

  // Change Password
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req,
    @Body() { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
  ) {
    return this.studentService.changePassword(req.user.id, currentPassword, newPassword);
  }

  // Reset Password
  @Post('forgot-password')
  async forgetPassword(@Body() { email, newPassword }: { email: string; newPassword: string }) {
    return this.studentService.forgetPassword(email, newPassword);
  }

  // Get all courses
  @UseGuards(JwtAuthGuard)
  @Get('courses')
  async getCourses() {
    return this.studentService.getAllCourses();
  }

  // Get course description and feedback
  @UseGuards(JwtAuthGuard)
  @Get('courses/:id')
  async getCourseDetails(@Param('id') courseId: number) {
    return this.studentService.getCourseDetails(courseId);
  }

  // Add course
  @UseGuards(JwtAuthGuard)
  @Post('courses/:id')
  async addCourse(@Req() req, @Param('id') courseId: number) {
    return this.studentService.addCourse(req.user.id, courseId);
  }

  // Remove course
  @UseGuards(JwtAuthGuard)
  @Delete('courses/:id')
  async removeCourse(@Req() req, @Param('id') courseId: number) {
    return this.studentService.removeCourse(req.user.id, courseId);
  }

  // Add feedback
  @UseGuards(JwtAuthGuard)
  @Post('courses/:id/feedback')
  async addFeedback(
    @Req() req,
    @Param('id') courseId: number,
    @Body() { feedback }: { feedback: string },
  ) {
    return this.studentService.addFeedback(req.user.id, courseId, feedback);
  }
}
