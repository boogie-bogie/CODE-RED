import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies.Authentication;
    console.log('request.cookies', request.cookies.Authentication);
    console.log('request.headers', request.headers.authentication);
    if (!accessToken) {
      return true;
    }

    try {
      const secretOrKey = this.configService.get('JWT_SECRET_KEY');
      console.log(accessToken);
      const payload = await this.jwtService.verify(accessToken, secretOrKey);
      console.log('Payload:', payload);
      request.user = payload; // Payload 정보를 request.user에 저장
      return true;
    } catch (error) {
      console.error('JWT 검증 오류:', error.message);
      throw new UnauthorizedException('인증 토큰이 유효하지 않습니다.');
    }
  }
}
