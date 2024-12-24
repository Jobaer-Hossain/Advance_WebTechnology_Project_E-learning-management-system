import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentModule } from './student/student.module';
import { Course } from './student/entities/course.entity';
import { Student } from './student/entities/student.entity';
import { Feedback } from './student/entities/feedback.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345678',
      database: 'StudentDB',
      entities: [Student , Course, Feedback],
      synchronize: true,
      
    }),
    StudentModule
    
  ],
})
export class AppModule {}
