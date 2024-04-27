import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { DataSource, Double, Repository } from 'typeorm';
import { LocationDto } from './dto/location.dto';
import { MaydayRecords } from './entities/mayday-records.entity';
import _ from 'lodash';
import { Scores } from 'webapp/src/common/entities/scores.entity';
import { RescueCompleteDto } from './dto/rescueCompleteDto.dto';
import { SendRescueMessageDto } from './dto/sendRescueMessage.dto';
import { Users } from 'webapp/src/common/entities/users.entity';

@Injectable()
export class MaydayService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(MaydayRecords)
    private readonly maydayRecordsRepository: Repository<MaydayRecords>,
    @InjectRepository(Scores)
    private readonly scoreRepository: Repository<Scores>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly dataSource: DataSource,
  ) {}

  // 내위치 정보 저장
  async saveMyLocation(location: LocationDto, userId: number) {
    const { latitude, longitude } = location;

    const user = await this.findUserId(userId);

    if (user) {
      await this.locationRepository
        .createQueryBuilder()
        .update()
        .set({
          latitude: latitude,
          longitude: longitude,
          location: () => `ST_GeomFromText('POINT(${longitude} ${latitude})')`,
        })
        .where('user_id = :userId', { userId: userId })
        .execute();
    } else {
      await this.locationRepository
        .createQueryBuilder()
        .insert()
        .into('location')
        .values({
          user_id: userId,
          latitude: latitude,
          longitude: longitude,
          location: () => `ST_GeomFromText('POINT(${longitude} ${latitude})')`,
        })
        .execute();
    }
  }

  // 내 위치 기반 유저 찾기
  async findHelper(userId: number) {
    const user = await this.findUserId(userId);
    const { latitude, longitude } = user;

    const distance = 1000;

    const helpers = await this.findHelperDistance(
      distance,
      latitude,
      longitude,
    );

    return {
      helpers,
      distanceThreshold: distance / 1000,
    };
  }

  // 구조 요청 보내기
  async sendRequestRescue(
    userId: number,
    sendRescueMessageDto: SendRescueMessageDto,
  ) {
    const { context } = sendRescueMessageDto;

    const user = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.location', 'location')
      .select('users.name')
      .addSelect('location.latitude')
      .addSelect('location.longitude')
      .where('users.id = :userId', { userId })
      .getOne();

    await this.maydayRecordsRepository.insert({ user_id: userId, context });

    let currentDistance = 1000;

    await this.sendAlert(
      currentDistance,
      user.location.latitude,
      user.location.longitude,
      user.name,
      context,
    );

    const checkHelperResponsePromise = (
      userId: number,
      currentDistance: number,
      latitude: number,
      longitude: number,
      name: string,
      context: string,
    ) => {
      return new Promise((resolve) => {
        const setIntervalId = setInterval(async () => {
          currentDistance += 1000;

          const message = await this.checkHelperResponse(
            userId,
            currentDistance,
            latitude,
            longitude,
            name,
            context,
            setIntervalId,
          );

          if (message) {
            resolve(message);
          }
        }, 30 * 1000);
      });
    };

    return await checkHelperResponsePromise(
      userId,
      currentDistance,
      user.location.latitude,
      user.location.longitude,
      user.name,
      context,
    );
  }

  // 푸시 알림 보내기
  async sendAlert(
    distance: number,
    latitude: number,
    longitude: number,
    name: string,
    message: string,
  ) {
    // 헬퍼 구조 요청 페이지에 가야할 것들유저닉네임, 거리, 메세지
    // localhost:3000/mayday/help-request?name=곽곽&distance=1km&message='살려주세요'
    const helpers = await this.findHelperDistance(
      distance,
      latitude,
      longitude,
    );
    // await this.fcmService.sendPushNotification(title = "구조요청", message = context, userId = helpers.user_id);
  }

  // 요청 수락했는지  확인하기
  async checkHelperResponse(
    userId: number,
    distance: number,
    latitude: number,
    longitude: number,
    name: string,
    message: string,
    setIntervalId: NodeJS.Timeout,
  ) {
    const record = await this.findGetMaydayRecord(userId);

    if (record.helper_id) {
      clearInterval(setIntervalId);
      return { message: 'Accepted' };
    } else if (distance > 3000) {
      clearInterval(setIntervalId);
      return { message: 'NotAccept' };
    } else if (_.isNil(record.helper_id)) {
      await this.sendAlert(distance, latitude, longitude, name, message);
    }
  }

  // 알림 받은 유저 정보 저장 및 거리 계산
  async acceptRescue(helperId: number, locationDto: LocationDto) {
    const { latitude, longitude, userName } = locationDto;

    const user = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.location', 'location')
      .select('users.id')
      .addSelect('location.latitude')
      .addSelect('location.longitude')
      .where('users.name = :userName', { userName })
      .getOne();

    const latestRecord = await this.findGetMaydayRecord(user.id);

    if (!_.isNil(latestRecord.helper_id)) {
      throw new BadRequestException('이미 헬퍼가 배정되었습니다.');
    }

    const distanceMeter = await this.shortestDistance(
      latitude,
      longitude,
      user.location.latitude,
      user.location.longitude,
    );

    const helper = await this.userRepository.findOne({
      where: { id: helperId },
    });

    const distance = distanceMeter.shortest_distance / 1000;

    await this.maydayRecordsRepository.update(
      { id: latestRecord.id },
      { helper_id: helperId, distance: distance },
    );

    return {
      distance: Number(distance.toFixed(1)),
      helperName: helper.name,
      message: latestRecord.context,
    };
  }

  // 유저 기록 확인
  async matchInfo(userId: number) {
    const rescueRecord = await this.findGetMaydayRecord(userId);

    const helper = await this.userRepository.findOne({
      where: { id: rescueRecord.helper_id },
    });
    const distance = +rescueRecord.distance;
    return {
      distance: Number(distance.toFixed(1)),
      helperName: helper.name,
      message: rescueRecord.context,
    };
  }

  // 구조 요청 완료(포인트 및 구조 요청완료 하기)
  async rescueComplete(userId: number, rescueCompleteDto: RescueCompleteDto) {
    const { score, reason } = rescueCompleteDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      const latestRecord = await this.findGetMaydayRecord(userId);

      await this.maydayRecordsRepository.update(
        { id: latestRecord.id },
        { is_completed: true },
      );

      await this.scoreRepository.insert({
        user_id: latestRecord.helper_id,
        record_id: latestRecord.id,
        reason,
        score,
      });

      return 'success';
    } catch (err) {
      console.log('Rollback 실행..');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // 거리순 주변 인물.대피소 찾기
  async findHelperDistance(distance, latitude, longitude) {
    const distanceThreshold = distance;
    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .select([
        'location.*',
        `ST_Distance(ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                             ST_SetSRID(location.location, 4326)::geography) AS distance_meters`,
      ])
      .setParameter('longitude', longitude)
      .setParameter('latitude', latitude)
      .where(
        `ST_Distance(ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, 
                          ST_SetSRID(location.location, 4326)::geography)<= :distanceThreshold`,
        {
          distanceThreshold,
        },
      )
      .orderBy('distance_meters');

    const helpersArray = await queryBuilder.getRawMany();

    const helpers = helpersArray.filter((helper) => helper.distance_meters > 0);
    return helpers;
  }

  // 거리 계산
  async shortestDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const distance = await this.locationRepository
      .createQueryBuilder()
      .select(
        `
    ST_Distance(
      ST_SetSRID(ST_MakePoint(:lon1, :lat1), 4326)::geography,
      ST_SetSRID(ST_MakePoint(:lon2, :lat2), 4326)::geography
    ) AS shortest_distance
  `,
      )
      .setParameter('lon1', lon1)
      .setParameter('lat1', lat1)
      .setParameter('lon2', lon2)
      .setParameter('lat2', lat2)
      .getRawOne();

    return distance;
  }

  // 유저 아이디로 찾기
  async findUserId(userId: number) {
    const user = await this.locationRepository.findOne({
      where: { user_id: userId },
    });

    return user;
  }

  // 유저 아이디로 최근 구조요청 찾기
  async findGetMaydayRecord(userId: number) {
    const latestRecord = await this.maydayRecordsRepository.findOne({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
    return latestRecord;
  }
}
