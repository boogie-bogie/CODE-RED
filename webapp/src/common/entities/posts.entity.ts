import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './base-model.entity';
import { PostStatus } from '../types/post-status.type';
import { Users } from './users.entity';

@Entity({ name: 'posts' })
export class Posts extends BaseModel {
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'enum', enum: PostStatus, nullable: false })
  status: PostStatus;

  @Column({ type: 'varchar', nullable: true })
  post_image: string;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  // user_id
  @ManyToOne(() => Users, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;
}
