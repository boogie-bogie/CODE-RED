import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest(); //jwt 에서 토큰 잡아서?
    return request.user ? request.user : null;
  },
);
