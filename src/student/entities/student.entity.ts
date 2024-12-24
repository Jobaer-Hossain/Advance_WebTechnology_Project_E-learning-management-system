import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
  import { Course } from './course.entity';
  
  @Entity()
  export class Student {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column()
    name: string;
  
    @Column({ default: 0 })
    totalPayable: number;
  
    @ManyToMany(() => Course, (course) => course.students, { cascade: true })
    @JoinTable()
    courses: Course[];
  }
  