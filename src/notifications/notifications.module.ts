import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { RedisService } from './redis/redis.service';
import { GeoLocationService } from './streams/user-location-streams/user-location.service';
import { DisasterService } from './streams/disaster-streams/disaster.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisasterData } from 'src/common/entities/disaster-data.entity';
import { HttpModule } from '@nestjs/axios';
import { NotificationMessages } from 'src/common/entities/notification-messages.entity';
import { RealtimeNotificationService } from './streams/realtime-notifications.service';
import { UtilsModule } from 'src/utils/utils.module';
import { FcmService } from './messaging-services/firebase/fcm.service';
import { BullModule } from '@nestjs/bull';
import { UsersModule } from 'src/users/users.module';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([DisasterData, NotificationMessages]),
    BullModule.registerQueue(
      {
        name: 'rescueServiceQueue',
      },
      {
        name: 'chatServiceQueue',
      },
    ),
    HttpModule,
    UtilsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    JwtModule,
    AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    RedisService,
    GeoLocationService,
    DisasterService,
    RealtimeNotificationService,
    FcmService,
    QueueModule,
  ],
  exports: [
    RedisService,
    GeoLocationService,
    FcmService,
    NotificationsService,
    RealtimeNotificationService,
  ],
})
export class NotificationsModule {}
