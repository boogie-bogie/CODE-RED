import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { MaydayService } from './mayday.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'webapp/src/common/decorator/user.decorator';
import { Users } from 'webapp/src/common/entities/users.entity';
import { LocationDto } from './dto/location.dto';
import { RescueCompleteDto } from './dto/rescueCompleteDto.dto';
import { SendRescueMessageDto } from './dto/sendRescueMessage.dto';

@Controller('mayday')
@UseGuards(AuthGuard('jwt'))
export class MaydayController {
  constructor(private readonly maydayService: MaydayService) {}

  // 내위치 정보 저장
  @Post()
  async saveMyLocation(
    @UserInfo() user: Users,
    @Body() locationDto: LocationDto,
  ) {
    await this.maydayService.saveMyLocation(locationDto, user.id);
    return { message: '위치정보 저장 성공' };
  }

  // 내 위치 기반 유저 찾기
  @Get('findHelper')
  @Render('rescue/rescue-request')
  async findHelper(@UserInfo() user: Users) {
    const helpersAndDistance = await this.maydayService.findHelper(user.id);
    return {
      helpers: helpersAndDistance.helpers,
      distance: helpersAndDistance.distanceThreshold,
    };
  }

  // 구조 요청 보내기
  @Post('sos')
  async sendRequestRescue(
    @UserInfo() user: Users,
    @Body() sendRescueMessageDto: SendRescueMessageDto,
  ) {
    const message = await this.maydayService.sendRequestRescue(
      user.id,
      sendRescueMessageDto,
    );

    return message;
  }

  // 헬퍼 구조 요청 페이지
  @Get('help-request')
  @Render('rescue/helper')
  helperPage(@Query() rescue: any) {
    const { distance, username, message } = rescue;

    return { distance: distance, username: username, message: message };
  }

  @Post('accept-rescue')
  async acceptRescue(
    @UserInfo() helper: Users,
    @Body() locationDto: LocationDto,
  ) {
    const result = await this.maydayService.acceptRescue(
      helper.id,
      locationDto,
    );

    return {
      distance: result.distance,
      helperName: result.helperName,
      message: result.message,
    };
  }

  @Get('matchHelper')
  @Render('rescue/matchHelper')
  matchHelperPage(@Query() helpeInfo: any) {
    const { distance, helperName, message } = helpeInfo;

    return { distance: distance, helperName: helperName, message: message };
  }

  @Get('match')
  @Render('rescue/matchHelper')
  async matchUserPage(@UserInfo() user: Users) {
    const matchInfo = await this.maydayService.matchInfo(user.id);
    return {
      distance: matchInfo.distance,
      helperName: matchInfo.helperName,
      message: matchInfo.message,
    };
  }

  // 구조 요청 완료 하기
  @Patch('rescue-complete')
  async rescueComplete(
    @UserInfo() user: Users,
    @Body() rescueCompleteDto: RescueCompleteDto,
  ) {
    const message = await this.maydayService.rescueComplete(
      user.id,
      rescueCompleteDto,
    );
    return { message: message };
  }
}
