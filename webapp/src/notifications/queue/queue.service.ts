import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('rescueServiceQueue') private rescueServiceQueue: Queue,
  ) {}

  async sendRequestRescue(requestRescueData: any) {
    // 'send-request' 이름으로 작업 추가
    await this.rescueServiceQueue.add('send-request', requestRescueData);

    // 요청자의 알림을 Redis에 저장
    const userNotificationsKey = `user:${requestRescueData.name}:notifications`;
    await this.rescueServiceQueue.client.lpush(
      userNotificationsKey,
      JSON.stringify({
        message: `구조 요청 알림: ${requestRescueData.message}`,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  async sendAcceptRescue(acceptRescueData: any) {
    // 'send-accept' 이름으로 작업 추가
    await this.rescueServiceQueue.add('send-accept', acceptRescueData);

    // 구조자의 알림을 Redis에 저장
    const userNotificationsKey = `user:${acceptRescueData.rescuerName}:notifications`;
    await this.rescueServiceQueue.client.lpush(
      userNotificationsKey,
      JSON.stringify({
        message: `구조 요청 수락 알림: ${acceptRescueData.message}`,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
