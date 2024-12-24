import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './register-student.dto';

export class UpdateStudentDto extends PartialType(RegisterDto) {}
