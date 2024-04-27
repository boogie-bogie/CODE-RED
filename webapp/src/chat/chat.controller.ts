import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  @Get()
  getChatPage(@Res() res: Response): void {
    const filePath = path.resolve('src', 'chat', 'chat.html'); // html 파일 경로 설정 src/chat/chat.html
    res.sendFile(filePath);
  }
}
