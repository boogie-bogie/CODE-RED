import { Module, forwardRef } from '@nestjs/common';
import { AuthService, KakaoLogin } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from 'webapp/src/users/users.module';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'webapp/src/common/entities/users.entity';
import { AwsModule } from 'webapp/src/aws/aws.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './guard/client-custom.guard';
import { UtilsModule } from 'webapp/src/utils/utils.module';
import { NotificationsModule } from 'webapp/src/notifications/notifications.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
    TypeOrmModule.forFeature([Users]),
    AwsModule,
    UtilsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, KakaoLogin, JwtAuthGuard, JwtService],
  exports: [JwtAuthGuard, JwtService],
})
export class AuthModule {}
