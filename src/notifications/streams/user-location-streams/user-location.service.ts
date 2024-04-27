import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.client';
import { RedisKeys } from 'src/notifications/redis/redis.keys';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class GeoLocationService {
  private readonly logger = new Logger(GeoLocationService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  /**
   * Producer - 사용자 위치정보 모니터링 (지속적으로 데이터 수집 -> User-Locations-Streams 적재)
   */

  // 1-1. KAKAO API에서 역지오코딩으로 사용자 위치의 지역명 추출하는 로직
  async getAreaFromCoordinates(
    latitude: number,
    longitude: number,
    user_id?: number,
    client_id?: string,
  ): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('KAKAO_REST_API_KEY');
      const response = await this.httpService
        .get(
          `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${longitude}&y=${latitude}`,
          {
            headers: {
              Authorization: `KakaoAK ${apiKey}`,
            },
          },
        )
        .toPromise();

      const region1DepthName = response.data.documents[0].region_1depth_name;
      const region2DepthName = response.data.documents[0].region_2depth_name;

      const area = `${region1DepthName} ${region2DepthName}`;

      await this.addUserToLocationStream(area, user_id, client_id);
      this.logger.log(
        `역지오코딩-- ${user_id || client_id} 사용자 위치 정보 스트림 추가 성공`,
        area,
      );
      return area;
    } catch (error) {
      this.logger.error('사용자 위치 정보를 지역 스트림에 추가 실패:', error);
      throw error;
    }
  }

  // 1-2. 사용자 위치 정보를 해당 지역 스트림에 추가
  async addUserToLocationStream(
    area: string,
    user_id?: number,
    client_id?: string,
  ) {
    const userLocationsStreamKey = RedisKeys.userLocationsStream(area);
    const userIdStr = user_id ? user_id.toString() : 'undefined';
    const clientIdStr = client_id ? client_id : 'undefined';

    await this.redisService.client.xadd(
      userLocationsStreamKey,
      '*',
      'user_id',
      userIdStr,
      'client_id',
      clientIdStr,
    );
  }

  // 사용자 위치 정보 스트림 메세지 자동 정리
  @Interval(86400000) // 24시간
  async trimUserLocationStreams() {
    let cursor = '0';
    do {
      // SCAN 명령을 사용하여 키를 검색
      const reply = await this.redisService.client.scan(
        cursor,
        'MATCH',
        'user-locationsStream:*',
        'COUNT',
        100,
      );
      cursor = reply[0]; // 새 커서 위치
      const keys = reply[1]; // 발견된 키 목록

      for (const streamKey of keys) {
        await this.redisService.client.xtrim(streamKey, 'MAXLEN', '~', 1000); // 스트림 크기 조정
        this.logger.log(`사용자 위치 정보 스트림 ${streamKey} 정리 완료.`);
      }
    } while (cursor !== '0');
  }
}
