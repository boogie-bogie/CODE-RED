import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from 'webapp/src/common/entities/news.entity';
import { NewsLevel } from 'webapp/src/common/types/news-level.type';
import { MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
  ) {}

  async findAllNews(pagenum: number) {
    return await this.pagenationNews(pagenum);
  }

  async findAccidentNews() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await this.newsRepository.find({
      where: {
        created_at: MoreThanOrEqual(today),
        news_level: NewsLevel.Danger,
      },
      order: { created_at: 'DESC' },
    });
  }

  async pagenationNews(pageNum: number) {
    const pageSize = 5;
    if (isNaN(pageNum)) {
      pageNum = 0;
    } else {
      pageNum = pageNum - 1;
    }
    const curruntpage = pageSize * pageNum;

    const news = await this.newsRepository
      .createQueryBuilder('news')
      .orderBy('news.created_at', 'DESC')
      .offset(curruntpage)
      .limit(pageSize)
      .getMany();

    console.log(news);

    return news;
  }
}
