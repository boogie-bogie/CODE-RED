import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import path from 'path';

import { UserInfo } from 'webapp/src/common/decorator/user.decorator';
import { Users } from 'webapp/src/common/entities/users.entity';

// ! 인가 관련 부분은 로그인 프론트 만들어지면 주석 해제 (현재 client-prompt로 userId 받아 사용)
@Controller('/dm')
export class DmController {
  // @UseGuards(AuthGuard('jwt'))
  @Get()
  serveDMPage(@Res() res: Response, @UserInfo() user: Users) {
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      'public',
      'dm',
      'direct-message.html',
    );

    // res.cookie('userId', user.id);
    return res.sendFile(filePath);
  }
}
