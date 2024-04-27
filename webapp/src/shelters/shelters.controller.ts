import { Controller, Get, Post, Query, Search } from '@nestjs/common';
import { SheltersService } from './shelters.service';

@Controller('shelters')
export class SheltersController {
  constructor(private sheltersService: SheltersService) {}

  @Get('data')
  async getShelters() {
    await this.sheltersService.getShelters();
    return { message: '데이터 저장 완료' };
  }

  @Get('searchMap')
  async getSheltersMap(@Query('search') search: string) {
    const findShelterData = await this.sheltersService.getSheltersMap(search);
    return findShelterData;
  }
}
