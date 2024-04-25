import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
  }

  onModuleInit() {
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
