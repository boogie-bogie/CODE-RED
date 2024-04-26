import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor() {
    console.log(
      '------------------------------------------------------------------------REDIS_HOST:',
      process.env.REDIS_HOST || 'No REDIS_HOST',
    );
    console.log(
      '------------------------------------------------------------------------REDIS_PORT:',
      process.env.REDIS_PORT || 'No REDIS_PORT',
    );
    console.log(
      '------------------------------------------------------------------------REDIS_PASSWORD:',
      process.env.REDIS_PASSWORD ? 'set' : 'not set',
    );

    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        // 3초 후에 재연결 시도, 최대 10번까지 재시도
        if (times < 10) {
          return 3000; // 3초 후 재시도
        }
        return null; // 더 이상 재시도하지 않음
      },
    });
  }

  onModuleInit() {
    console.log(
      '------------------------------------------------------------------------REDIS_HOST:',
      process.env.REDIS_HOST || 'No REDIS_HOST',
    );
    console.log(
      '------------------------------------------------------------------------REDIS_PORT:',
      process.env.REDIS_PORT || 'No REDIS_PORT',
    );
    console.log(
      '------------------------------------------------------------------------REDIS_PASSWORD:',
      process.env.REDIS_PASSWORD ? 'set' : 'not set',
    );

    this.redisClient.on('connect', () => {
      console.log('################################### Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 레디스 에러', err);
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
    console.log(
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Redis connection closed.',
    );
  }

  get client(): Redis {
    return this.redisClient;
  }
}
