import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'webapp/src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationMessages } from 'webapp/src/common/entities/notification-messages.entity';
import { Repository } from 'typeorm';
import { NotificationStatus } from 'webapp/src/common/types/notification-status.type';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_DELAYS = [1000, 2000, 4000];

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @InjectRepository(NotificationMessages)
    private notificationMessagesRepository: Repository<NotificationMessages>,
  ) {
    this.initializeFirebase();
  }
  // Firebase 초기화
  private initializeFirebase(): void {
    try {
      const privateKey = this.configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        .replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          privateKey: privateKey,
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        }),
      });
    } catch (error) {
      this.logger.error('Firebase 초기화 실패, initialization failed:', error);
    }
  }
  /** FCM 알림 전송 로직
   * 1. 회원/비회원 푸시 토큰 조회
   * 2. 알림 전송
   * 3. 전송 성공/실패한 알림 DB 저장
   * 4. 재시도 3번 수행 후 결과에 따라 DB 발송 상태 업데이트
   */

  async sendPushNotification(
    title: string,
    message: string,
    userId?: number,
    clientId?: string,
  ) {
    // 1-1. 회원(userId), 비회원(clientId)로 해당 사용자의 푸시 토큰 조회해서 payload에 전달
    const token = await this.usersService.getTokenByIdentifiers(
      userId,
      clientId,
    );

    // 1-2. 알림 전송
    const payload = {
      token,
      notification: {
        title: title,
        body: message,
      },
    };

    try {
      // 1-3. 전송 성공한 알림 DB 저장
      const response = await admin.messaging().send(payload);
      await this.saveSendingResult(
        title,
        message,
        NotificationStatus.UnRead,
        userId,
        clientId,
      );
      this.logger.log(
        `알림 전송 성공, Notification sent successfully: ${response}`,
      );
    } catch (error) {
      const failedMessage = await this.saveSendingResult(
        title,
        message,
        NotificationStatus.Failed,
        userId,
        clientId,
      );
      this.logger.error(
        `알림 전송 실패, Failed to send notification: ${error.message}`,
      );

      if (this.isRetryError(error.code)) {
        this.retrySendPushNotifications(payload, 0, userId, clientId);
      }
    }
  }

  // 1-4. 전송 성공/실패한 알림 DB 저장
  private async saveSendingResult(
    title: string,
    message: string,
    status: NotificationStatus,
    userId?: number,
    clientId?: string,
  ) {
    const sendingResult = this.notificationMessagesRepository.create({
      user_id: userId,
      client_id: clientId,
      title,
      message,
      status,
    });
    await this.notificationMessagesRepository.save(sendingResult);
  }

  private isRetryError(code: string): boolean {
    return (
      code === 'messaging/internal-error' ||
      code === 'messaging/server-unavailable'
    );
  }

  private async retrySendPushNotifications(
    payload: any,
    attempt: number,
    userId?: number,
    clientId?: string,
  ) {
    if (attempt < this.MAX_RETRY_COUNT) {
      setTimeout(async () => {
        try {
          const response = await admin.messaging().send(payload);
          await this.saveSendingResult(
            payload.notification.title,
            payload.notification.body,
            NotificationStatus.UnRead,
            userId,
            clientId,
          );

          this.logger.log(
            `재시도 성공, 시도 횟수 ${attempt + 1} success: ${response}`,
          );
        } catch (error) {
          this.logger.error(
            `재시도 실패, 시도 횟수 ${attempt + 1} failed: ${error.message}`,
          );
          if (attempt + 1 < this.MAX_RETRY_COUNT) {
            this.retrySendPushNotifications(
              payload,
              attempt + 1,
              userId,
              clientId,
            );
          } else {
            this.logger.error('재시도 3회 달성, 재시도 중단.');
          }
        }
      }, this.RETRY_DELAYS[attempt]);
    }
  }
}
