import { Controller, Get, Query, Render } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @Render('news/news')
  async findAllNews(@Query('pagenum') pagenum: number) {
    const news = await this.newsService.findAllNews(pagenum);
    return { news: news };
  }

  @Get('accident')
  async findAccidentNews() {
    return await this.newsService.findAccidentNews();
  }
}
