import { Controller, Get, Render } from '@nestjs/common';
import { NewsService } from './news/news.service';

@Controller('/main')
export class AppController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @Render('main/main')
  async main() {
    const news = await this.newsService.findAccidentNews();
    return { news: news };
  }
}
