import { Injectable, Logger } from '@nestjs/common';
import {
  DisasterMessage,
  RedisStreamField,
} from 'webapp/src/common/types/disaster-message.interface';

@Injectable()
export class DisasterMessageParserService {
  private logger = new Logger(DisasterMessageParserService.name);

  // Redis에서 가져온 메시지 필드를 파싱하여 DisasterMessage 객체로 변환
  parseDisasterMessage(fields: RedisStreamField[]): DisasterMessage {
    const messageData: Record<string, string> = fields.reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {},
    );

    try {
      const parsedData = JSON.parse(messageData['message']);

      // 데이터 유효성 검사 및 타입 확인
      const disasterMessage: DisasterMessage = {
        user_id: parsedData.user_id
          ? parseInt(parsedData.user_id, 10)
          : undefined,
        client_id: parsedData.client_id || undefined,
        region: parsedData.large_category.join(', '),
        content: parsedData.message,
        send_datetime: new Date(parsedData.send_datetime),
      };

      this.logger.log(`재난 문자 파싱 성공, data: ${disasterMessage}`);
      return disasterMessage;
    } catch (error) {
      this.logger.log(
        `재난 문자 파싱 에러, Error parsing disaster message: ${error.message}, data: ${messageData['message']}`,
      );
    }
  }
}
