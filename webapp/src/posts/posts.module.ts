import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from 'webapp/src/common/entities/posts.entity';
import { AwsModule } from 'webapp/src/aws/aws.module';
import { NotificationsModule } from 'webapp/src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Posts]), AwsModule, NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
