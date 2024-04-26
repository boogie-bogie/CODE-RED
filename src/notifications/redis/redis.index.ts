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
      password: process.env.REDIS_PASSWORD || undefined,
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
      console.log('Connected to Redis');
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  get client(): Redis {
    return this.redisClient;
  }
}
