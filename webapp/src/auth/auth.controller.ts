import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  UploadedFile,
  UseInterceptors,
  Header,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'webapp/src/users/dto/create-user.dto';
import { LoginDto } from 'webapp/src/users/dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { KakaoLogin } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly kakaoLogin: KakaoLogin,
    private readonly configService: ConfigService,
  ) {}

  @Post('/sign-up')
  @UseInterceptors(FileInterceptor('image'))
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.authService.signUp(file, createUserDto);
  }

  @Post('/sign-in')
  async signIn(@Body() loginDto: LoginDto, @Res() res) {
    const user = await this.authService.signIn(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('Authentication', user.access_token, {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    });
    res.end();
  }

  // kakaoLogin 으로 접속하면 보이는 로그인 화면 구성
  @Get('kakaoLogin')
  @Header('Content-Type', 'text/html')
  getKakaoLoginPage(): string {
    return `
        <div>
          <h1>카카오 로그인</h1>
  
          <form action="/auth/kakaoLoginLogic" method="GET">
            <input type="submit" value="카카오로그인" />
          </form>
  
          <form action="/auth/kakaoLogout" method="GET">
            <input type="submit" value="카카오로그아웃 및 연결 끊기" />
          </form>
        </div>
      `;
  }

  // 카카오와 로그인을 진행할 수 있도록 사용자의 요청을 redirect 시켜서 카카오 로그인 화면을 보게 함.
  // 사용자가 카카오 로그인을 마치면 redirect URI 의 주소로 카카오에서 전달
  // 카카오 로그인이 완료 되었다면 redirect URI 주소의 쿼리로 로그인 인증 코드가 들어옴.
  // 해당 인증 코드로 토큰을 받아오도록 서버에서 다시 카카오로 요청
  @Get('kakaoLoginLogic')
  @Header('Content-Type', 'text/html')
  kakaoLoginLogic(@Res() res): void {
    const _hostName = 'https://kauth.kakao.com';
    const KAKAO_LOGIN_REST_API_KEY = this.configService.get<string>(
      'KAKAO_LOGIN_REST_API_KEY',
    ); // .env에서 JWT_SECRET_KEY 가져오기
    const _restApiKey = KAKAO_LOGIN_REST_API_KEY;
    // 카카오 로그인 RedirectURI 등록
    const _redirectUrl = 'http://127.0.0.1:3000/auth/kakaoLoginLogicRedirect';
    const url = `${_hostName}/oauth/authorize?client_id=${_restApiKey}&redirect_uri=${_redirectUrl}&response_type=code`;
    return res.redirect(url);
  }

  // 서버에서 제공한 인증 코드를 통해 서버에서 카카오에 요청하여 토큰을 발급받는 내용
  // 로그인 완료 후 로그아웃 시에 토큰이 필요하므로 미리 provider 에 저장
  @Get('kakaoLoginLogicRedirect')
  @Header('Content-Type', 'text/html')
  kakaoLoginLogicRedirect(@Query() qs, @Res() res): void {
    console.log(qs.code);
    const KAKAO_LOGIN_REST_API_KEY = this.configService.get<string>(
      'KAKAO_LOGIN_REST_API_KEY',
    ); // .env에서 JWT_SECRET_KEY 가져오기
    const _restApiKey = KAKAO_LOGIN_REST_API_KEY;
    const _redirect_uri = 'http://127.0.0.1:3000/auth/kakaoLoginLogicRedirect';
    const _hostName = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${_restApiKey}&redirect_uri=${_redirect_uri}&code=${qs.code}`;
    const _headers = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    };
    this.kakaoLogin
      .login(_hostName, _headers)
      .then((e) => {
        console.log(`TOKEN : ${e.data['access_token']}`);
        this.kakaoLogin.setToken(e.data['access_token']);
        return res.send(`
            <div>
              <h2>축하합니다!</h2>
              <p>카카오 로그인 성공하였습니다 :)</p>
              <a href="/auth/kakaoLogin">메인으로</a>
            </div>
          `);
        // 토큰을 잘 받아왔으면 로그인이 완료된 것이므로 로그인 성공 화면을 보여줌.
      })
      .catch((err) => {
        console.log(err);
        return res.send('error');
      });
  }
  // 카카오 로그인 -> 고급에서 로그아웃 Logout Redirect URI 설정 필요
  @Get('kakaoLogout')
  kakaoLogout(@Res() res): void {
    console.log(`LOGOUT TOKEN : ${this.kakaoLogin.accessToken}`);

    // 로그아웃 - 토큰 만료
    this.kakaoLogin
      .logout()
      .then((e) => {
        return res.send(`
            <div>
              <h2>로그아웃 완료(토큰만료)</h2>
              <a href="/auth/kakaoLogin">메인 화면으로</a>
            </div>
          `);
      })
      .catch((e) => {
        console.log(e);
        return res.send('LogOUT ERROR');
      });
  }

  //@ApiOperation({ summary: '닉네임 변경', description: '업데이트' })
  // @UseGuards(JwtOpAuthGuard)
  // @Patch('')
  // async userUpdate(@Body() updateDto: UpdateDto, @Req() req: IGuestRequest) {
  //   const id = req.id;
  //   const userUpdate = await this.usersService.userUpdate(
  //     id,
  //     updateDto.nickName,
  //   );
  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: '닉네임 변경에 성공하였습니다.',
  //     userUpdate,
  //   };
  // }
}
