import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    OneToMany,
  } from 'typeorm';
  import { Student } from './student.entity';
  import { Feedback } from './feedback.entity';
  
  @Entity()
  export class Course {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
  
    @ManyToMany(() => Student, (student) => student.courses)
    students: Student[];
  
    @OneToMany(() => Feedback, (feedback) => feedback.course, { cascade: true })
    feedbacks: Feedback[];
  }
  