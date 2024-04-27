import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NewsLevel } from '../types/news-level.type';

@Entity({ name: 'news' })
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column({ type: 'varchar', nullable: false })
  media: string;

  @Column({
    type: 'enum',
    enum: NewsLevel,
    nullable: false,
    default: NewsLevel.Common,
  })
  news_level: NewsLevel;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;
}
