import _ from 'lodash';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from './redis/redis.index';
//import { Cache } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationMessages } from 'src/common/entities/notification-messages.entity';
import { In, Repository } from 'typeorm';
import { DisasterMessage } from 'src/common/types/disaster-message.interface';
import { RedisKeys } from './redis/redis.keys';
import { NotificationStatus } from 'src/common/types/notification-status.type';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationMessages)
    private notificationMessagesRepository: Repository<NotificationMessages>,
    //private redisService: RedisService,
    //private cacheManager: Cache,
  ) {}

  // 1. FCM 발송된 알림 목록 조회 API

  async getAllNotifications(userId?: number, clientId?: string) {
    const messageLists = await this.notificationMessagesRepository.find({
      where: [
        {
          user_id: userId,
          status: In([NotificationStatus.UnRead, NotificationStatus.Read]),
        },
        {
          client_id: clientId,
          status: In([NotificationStatus.UnRead, NotificationStatus.Read]),
        },
      ],
      order: { created_at: 'DESC' },
      take: 30, // 30개의 항목으로 제한
    });
    return messageLists;
  }

  // 2. 알림 목록 중 특정 알림 메세지 상세 조회 및 Read 상태 업데이트 API
  async getNotificationByIdAndUpdateStatus(messageId: number) {
    const readMessage = await this.notificationMessagesRepository.findOneBy({
      id: messageId,
    });
    if (!readMessage) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }
    readMessage.status = NotificationStatus.Read;
    await this.notificationMessagesRepository.save(readMessage);
    return readMessage;
  }

  /**
   * 특정 사용자 위치에 따른 재난 문자 목록 조회
   *
   * 추가 변경사항
   * - saveNotification 메서드 추가 및 NotificationMessages 엔티티 수정
   * - any 타입 -> 명확한 타입 사용으로 개선.
   *  // 1-0. Redis에 String으로 저장된 사용자 위치 <> Disaster-Streams 지역명 매칭시켜서 캐싱 후 재난 문자 목록 반환
  async getUserNotifications(userId: number): Promise<DisasterMessage[]> {
    const userAreaCacheKey = RedisKeys.userNotificationsCache(userId);
    let notifications =
      await this.cacheManager.get<DisasterMessage[]>(userAreaCacheKey);

    // Cache Hit! 알림 목록 반환
    if (notifications) {
      return notifications;
    }

    // Cache Miss!! -- 캐싱 후 재난 문자 목록 반환
    notifications = await this.retrieveAndCacheNotifications(
      userId,
      userAreaCacheKey,
    );
    return notifications;
  }

  // 1-1. Disaster-Streams에서 재난 문자 데이터 읽어서 DB 저장 및 캐싱
  private async retrieveAndCacheNotifications(
    userId: number,
    cacheKey: string,
  ): Promise<DisasterMessage[]> {
    const userArea = await this.getUserArea(userId);
    const disasterMessages = await this.getDisasterMessages(userArea);

    for (const message of disasterMessages) {
      await this.saveNotification(userId, message);
    }

    await this.cacheManager.set(cacheKey, disasterMessages, { ttl: 3600 });
    return disasterMessages;
  }

  private async getUserArea(userId: number): Promise<string> {
    const areaKey = RedisKeys.userAreaCache(userId);
    const area = await this.redisService.client.get(areaKey);

    if (!area) {
      throw new NotFoundException(
        '사용자 위치 정보가 없습니다. 위치 정보를 업데이트해주세요.',
      );
    }

    return area;
  }

  // 1-2. Disaster-Streams에서 재난 문자 데이터 메시지 읽어서 매핑
  private async getDisasterMessages(area: string): Promise<DisasterMessage[]> {
    const disasterStreamKey = RedisKeys.disasterStream(area);
    const rawMessages = await this.redisService.client.xrange(
      disasterStreamKey,
      '-',
      '+',
    );
    return rawMessages.map(([id, fields]) => this.parseDisasterMessage(fields));
  }

  // 1-3. 재난 문자 데이터 파싱
  private parseDisasterMessage(fields: string[]): DisasterMessage {
    let messageData: { [key: string]: string } = {};
    for (let i = 0; i < fields.length; i += 2) {
      messageData[fields[i]] = fields[i + 1];
    }

    const parsedData = JSON.parse(messageData['message']);

    // large_category가 배열이 아니거나 존재하지 않을 경우, 빈 배열을 할당합니다.
    const largeCategory = Array.isArray(parsedData.large_category)
      ? parsedData.large_category
      : [];

    return {
      user_id: parsedData.user_id,
      region: largeCategory.join(', '),
      content: parsedData.message,
      send_datetime: new Date(parsedData.send_datetime),
    };
  }

  // 1-4. 재난 문자 조회 기록 DB에 저장
  private async saveNotification(
    userId: number,
    message: DisasterMessage,
  ): Promise<void> {
    const notification = this.notificationMessageRepository.create({
      user_id: userId,
      region: message.region,
      content: message.content,
      send_datetime: new Date(message.send_datetime),
    });

    await this.notificationMessageRepository.save(notification);
  }
   */
}
