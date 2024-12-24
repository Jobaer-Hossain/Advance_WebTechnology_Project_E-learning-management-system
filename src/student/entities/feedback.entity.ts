import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { Course } from './course.entity';
  import { Student } from './student.entity';
  
  @Entity()
  export class Feedback {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    content: string;
  
    @ManyToOne(() => Course, (course) => course.feedbacks, { onDelete: 'CASCADE' })
    course: Course;
  
    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    student: Student;
  }
  