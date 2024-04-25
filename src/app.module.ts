import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { CommonModule } from './common/common.module';
import { AwsModule } from './aws/aws.module';
import { UtilsModule } from './utils/utils.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { MaydayModule } from './mayday/mayday.module';
import { ChatModule } from './chat/chat.module';
import { SheltersModule } from './shelters/shelters.module';
import { DmModule } from './direct-message/dm.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';

import { Users } from './common/entities/users.entity';
import { Posts } from './common/entities/posts.entity';
import { Follows } from './common/entities/follows.entity';
import { Scores } from './common/entities/scores.entity';
import { MaydayRecords } from './mayday/entities/mayday-records.entity';
import { Shelters } from './common/entities/shelters.entity';
import { DisasterData } from './common/entities/disaster-data.entity';
import { NotificationMessages } from './common/entities/notification-messages.entity';
import { News } from './common/entities/news.entity';
import { Location } from './mayday/entities/location.entity';
import { DirectMessages } from './common/entities/direct-messages.entity';
import { validationSchema } from './common/config/env.config';
import { NotificationsModule } from './notifications/notifications.module';
import * as redisStore from 'cache-manager-redis-store';
import { DestinationRiskController } from './destination-risk/destination-risk.controller';
import { DestinationRiskService } from './destination-risk/destination-risk.service';
import { DestinationRiskModule } from './destination-risk/destination-risk.module';
import { BullModule } from '@nestjs/bull';
import { QueueModule } from './notifications/queue/queue.module';
import { Clients } from './common/entities/clients.entity';
import { AppController } from './app.controller';
import { NewsModule } from './news/news.module';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(), //TypeORM에서 사용되는 네이밍 전략 중 하나, 데이터베이스 테이블과 컬럼의 이름을 스네이크 케이스(snake_case)로 변환하는 전략
    type: 'postgres',
    username: configService.get('POSTGRES_USERNAME'),
    password: configService.get('POSTGRES_PASSWORD'),
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    database: configService.get('POSTGRES_NAME'),
    synchronize: configService.get('POSTGRES_SYNC'), // 데이터베이스 스키마와 애플리케이션의 엔티티 클래스 간의 동기화를 제어, 일반적으로 false로 설정하여 동기화를 방지
    entities: [
      Users,
      Posts,
      Follows,
      Scores,
      MaydayRecords,
      Shelters,
      DisasterData,
      NotificationMessages,
      News,
      Location,
      Clients,
      DirectMessages,
    ],
    logging: true, // 데이터베이스 쿼리를 로깅할지 여부를 제어, 이 옵션을 true로 설정하면 TypeORM이 실행된 쿼리를 콘솔에 로그로 출력
  }),
  inject: [ConfigService], // 여기서 먼저 주입을 해주어야 useFactory에서 주입된 ConfigService를 사용할수 있음.
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    UsersModule,
    AuthModule,
    AwsModule,
    UsersModule,
    UtilsModule,
    PostsModule,
    NotificationsModule,
    ChatModule,
    MaydayModule,
    SheltersModule,
    DestinationRiskModule,
    QueueModule,
    DmModule,
    DmModule,
    NewsModule,
  ],
  controllers: [DestinationRiskController, AppController],
  providers: [DestinationRiskService],
})
export class AppModule {}
