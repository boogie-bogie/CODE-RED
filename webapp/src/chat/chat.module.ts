import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatFilterService } from './chat-filter.service';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatFilterService],
})
export class ChatModule {}
