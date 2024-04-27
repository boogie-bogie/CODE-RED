import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from 'webapp/src/common/entities/users.entity';
import { AuthGuard } from '@nestjs/passport';
import { LocationDto } from './dto/user-location.dto';
import { UserInfo } from 'webapp/src/common/decorator/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UtilsService } from 'webapp/src/utils/utils.service';
import { JwtAuthGuard } from 'webapp/src/auth/guard/client-custom.guard';
import { ClientsDto } from './dto/clients.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly utilsService: UtilsService,
  ) {}

  // 모든 유저 조회
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getUsers() {
    return this.usersService.getAllUsers();
  }

  // 유저 상세 조회
  @Get(':id')
  async getOneUsers(@Param('id') id: number) {
    return await this.usersService.findOne(id);
  }

  // 유저 수정
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @UserInfo() user: Users,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.update(id, user, updateUserDto, file);
  }

  //유저 삭제
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: number, @UserInfo() user: Users) {
    return await this.usersService.remove(id, user);
  }

  /** ----------------------- 사용자 푸시 토큰 및 위치 정보------------------------------ */

  /** 사용자 위치정보 수집
   * 1. 사용자 위치정보 활용 동의 '허용'
   * 2. 위도-경도 저장
   * 3. 위도-경도 -> 역지오코딩 -> redis set 저장 & stream 생성
   *
   */

  @UseGuards(JwtAuthGuard)
  @Post('register-location')
  async registerClientsLocation(
    @UserInfo() user: Users,
    @Body() body: ClientsDto,
  ) {
    const userId = user ? user.id : null;
    //uuid로 clientId 생성하는 함수
    let client_id = body.client_id;
    if (!client_id) {
      client_id = this.utilsService.getUUID();
    }
    const clientsDto = {
      ...body,
      user_id: userId,
      client_id: client_id,
    };
    const result = await this.usersService.updateClientsInfo(clientsDto);
    return result;
  }

  /** 사용자 푸시 토큰 정보 수집
   * 1. 클라이언트 사이드 main.html <script>에서 이 메서드를 호출하면서 푸시 토큰을 서버에 전달함.
   * 2. 로그인 회원: userLogin 내부 로직에서 로그인시 saveOrUpdateToken 얘를 호출해서
   *    clientId가 있고, 지금 로컬스토리지에 저장된 clientId랑 db에 저장된 clientId가 같으면,
   *     userId만 업데이트
   * 3. 위치정보 활용 정보 동의 -> 위도 경도 -> 역지오코딩 -> 지역명추출 -> token, clientId, userId를 스트림에 추가.
   */
  @UseGuards(JwtAuthGuard)
  @Post('register-token')
  async registerToken(@UserInfo() user: Users, @Body() body: ClientsDto) {
    const userId = user ? user.id : null;
    //uuid로 clientId 생성하는 함수
    let client_id = body.client_id;
    if (!client_id) {
      client_id = this.utilsService.getUUID();
    }
    const clientsDto = {
      ...body,
      user_id: userId,
      client_id: client_id,
    };
    const result = await this.usersService.updateClientsInfo(clientsDto);
    return result;
  }

  // 만료된 사용자 푸시 토큰 삭제

  @Delete('/cleanup/tokens')
  async cleanUpOldClientsData() {
    await this.usersService.cleanUpOldClientsData();
    return {
      message: '1주일 지난 토큰 청소 완료',
    };
  }
}
