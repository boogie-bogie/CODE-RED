import { Module } from '@nestjs/common';
import { MaydayService } from './mayday.service';
import { MaydayController } from './mayday.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { MaydayRecords } from './entities/mayday-records.entity';
import { JwtService } from '@nestjs/jwt';
import { Scores } from 'webapp/src/common/entities/scores.entity';
import { Users } from 'webapp/src/common/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location, MaydayRecords, Scores, Users])],
  controllers: [MaydayController],
  providers: [MaydayService, JwtService],
})
export class MaydayModule {}
