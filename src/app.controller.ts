import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Query,
  Render,
  Session,
} from '@nestjs/common';
import { NewsService } from './news/news.service';
import { AuthService } from './auth/auth.service';
import { DestinationRiskService } from './destination-risk/destination-risk.service';
import { SheltersService } from './shelters/shelters.service';
import { DisasterService } from './notifications/streams/disaster-streams/disaster.service';
import _ from 'lodash';

@Controller('/')
export class AppController {
  constructor(
    private readonly newsService: NewsService,
    private readonly authService: AuthService,
    private readonly destinationRiskService: DestinationRiskService,
    private readonly sheltersService: SheltersService,
    private readonly disasterService: DisasterService,
  ) {}

  @Get()
  @Render('main/basicPage')
  basic() {}

  @Get('main')
  @Render('main/main')
  async main(@Query('client_id') client_id?: string) {
    let latitude: number;
    let longitude: number;
    let score: number = 0;
    const keywords = [
      '지진',
      '강풍',
      '호우',
      '산불',
      '태풍',
      '홍수',
      '지진해일',
      '전염병',
      '테러',
      '폭동',
      '건조',
      '산사태',
      '폭염',
      '안개',
      '풍량',
      '미세먼지',
      '대조기',
      '가뭄',
      '대설',
      '한파',
      '황사',
      '교통통제',
      '화재',
      '붕괴',
      '폭발',
      '교통사고',
      '환경 오염사고',
      '에너지',
      '통신',
      '교통',
      '금융',
      '의료',
      '수도',
      '정전',
      '가스',
      'AI',
      '화생방사고',
      '비상사태',
      '민방공',
    ];

    // 위도 경도 뽑아내기(없다면 서울 시청 기준)(클라이언트 테이블 조회)
    if (!_.isNil(client_id) && Object.keys(client_id).length !== 0) {
      const client = await this.authService.findClientByClientId(client_id);

      latitude = client.latitude;
      longitude = client.longitude;
    } else {
      latitude = 37.566779160550716;
      longitude = 126.97869471811414;
    }
    // 나의 현재 위치명 받기
    const location = await this.destinationRiskService.getAreaCoordinates(
      longitude,
      latitude,
    );

    // 재난 메세지 지역명 받기
    const regionName = await this.destinationRiskService.getRegionCoordinates(
      longitude,
      latitude,
    );

    // 재난 현황(오늘 날짜)
    const disaster = await this.disasterService.findTodayDisaster();
    const responseDisaster = disaster.filter((data) => {
      const myRegion = data.locationName.includes(regionName);
      const containsKeyword = keywords.some((keyword) =>
        data.message.includes(keyword),
      );
      return myRegion && containsKeyword;
    });

    // 서울이 아닌 경우 재난 현황만 제공
    if (!location.includes('서울')) {
      return {
        isNotSeoul: true,
        location,
        responseDisaster,
      };
    }

    const realTimeDestinationRisk =
      await this.destinationRiskService.checkDestinationRisk({
        longitude,
        latitude,
      });

    const realTimeData = {
      realTimeCongestion: realTimeDestinationRisk['실시간 장소 혼잡도'],
      expectedPopulation: realTimeDestinationRisk['예상 인구'],
      standardTime: realTimeDestinationRisk['기준 시간'],
    };

    // 내 위치에서 가장 가까운 대피소
    const shelterInfo = await this.sheltersService.closeToShelter(
      longitude,
      latitude,
    );

    const shelter = shelterInfo.facility_name;

    // 사건 사고
    const news = await this.newsService.findAccidentNews();

    // 점수 매기기
    switch (realTimeDestinationRisk['실시간 장소 혼잡도']) {
      case '여유':
        score += 1;
        break;
      case '보통':
        score += 1;
        break;
      case '약간 붐빔':
        score += 2;
        break;
      case '붐빔':
        score += 3;
        break;
    }

    if (news.length >= 5) {
      score += 3;
    } else if (news.length >= 3) {
      score += 2;
    } else if (news.length >= 1) {
      score += 1;
    }

    return {
      location,
      realTimeData,
      news,
      shelter,
      responseDisaster,
      score,
    };
  }
}
