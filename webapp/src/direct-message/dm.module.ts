import { Module } from '@nestjs/common';
import { DmGateway } from './dm.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessages } from '../common/entities/direct-messages.entity';
import { DmController } from './dm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessages])],
  controllers: [DmController],
  providers: [DmGateway],
})
export class DmModule {}
