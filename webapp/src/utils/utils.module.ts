import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { DisasterMessageParserService } from './disaster-message.parser.service';

@Module({
  providers: [UtilsService, DisasterMessageParserService],
  exports: [UtilsService, DisasterMessageParserService],
})
export class UtilsModule {}
