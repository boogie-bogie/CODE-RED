import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from 'webapp/src/utils/utils.module';

@Module({
  imports: [ConfigModule, UtilsModule],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
