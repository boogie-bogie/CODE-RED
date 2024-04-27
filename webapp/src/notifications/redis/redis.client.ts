import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    console.log(
      '===============CONSTRUCTOR LOG============== REDIS_HOST:',
      process.env.REDIS_HOST || 'No REDIS_HOST',
    );
    console.log(
      '===============CONSTRUCTOR LOG============== REDIS_PORT:',
      process.env.REDIS_PORT || 'No REDIS_PORT',
    );
    console.log(
      '===============CONSTRUCTOR LOG============== REDIS_PASSWORD:',
      process.env.REDIS_PASSWORD ? 'set' : 'not set',
    );

    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => this.retryStrategy(times),
    });

    // 에러 핸들러 추가
    this.redisClient.on('error', (err) => {
      console.error(
        '===============CONSTRUCTOR LOG============== Redis 연결 에러 발생:',
        err,
      );
    });
  }

  private retryStrategy(times: number): number | null {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(
        `/*/*/*/*/*/*/*/*/*/*/*/* Redis 연결 재시도: ${this.retryCount}`,
      );
      // 재시도 간격 계산, 예: 각 재시도 후 500ms 증가, 최대 2000ms
      return Math.min(times * 500, 2000);
    } else {
      console.error('Redis 연결 재시도 실패');
      return null; // 중단 조건 반환
    }
  }

  async onModuleInit() {
    try {
      console.log(
        '=/=/=/=/=/=/=/=/=/=/=/=/=/=/=CONSTRUCTOR LOG=/=/=/=/=/=/=/=/=/=/=/=/=/= REDIS_HOST:',
        process.env.REDIS_HOST || 'No REDIS_HOST',
      );
      console.log(
        '=/=/=/=/=/=/=/=/=/=/=/=/=/=/=CONSTRUCTOR LOG=/=/=/=/=/=/=/=/=/=/=/=/=/= REDIS_PORT:',
        process.env.REDIS_PORT || 'No REDIS_PORT',
      );
      console.log(
        '=/=/=/=/=/=/=/=/=/=/=/=/=/=/=CONSTRUCTOR LOG=/=/=/=/=/=/=/=/=/=/=/=/=/= REDIS_PASSWORD:',
        process.env.REDIS_PASSWORD ? 'set' : 'not set',
      );

      await this.redisClient.connect();
      console.log(
        '################# onModuleInit ################## Connected to Redis',
      );
    } catch (error) {
      console.log(
        '@@@@@@@@@@@@@@@@@ onModuleInit @@@@@@@@@@@@@@@@@@ 레디스 에러',
        error,
      );
    }
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
    console.log(
      '%%%%%%%%%%%%%%%%%%%% onModuleDestroy %%%%%%%%%%%%%%%%%%% Redis connection closed.',
    );
  }

  get client(): Redis {
    return this.redisClient;
  }
}
