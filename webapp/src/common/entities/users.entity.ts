import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseModel } from './base-model.entity';
import { Roles } from '../types/user-role.type';
import { Posts } from './posts.entity';
import { Follows } from './follows.entity';
import { Scores } from './scores.entity';
import { MaydayRecords } from '../../mayday/entities/mayday-records.entity';
import { NotificationMessages } from './notification-messages.entity';
import { Location } from '../../mayday/entities/location.entity';
import { DirectMessages } from './direct-messages.entity';

@Entity({ name: 'users' })
export class Users extends BaseModel {
  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: false })
  phone_number: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  profile_image: string;

  @Column({ type: 'enum', enum: Roles, nullable: false, default: Roles.User })
  role: Roles;

  @OneToMany(() => Posts, (post) => post.user, { onDelete: 'CASCADE' })
  posts: Posts[];

  // @OneToMany(() => DirectMessages, (dm) => dm.user, { onDelete: 'NO ACTION' })
  // dms: DirectMessages[];

  @OneToMany(() => Follows, (follower) => follower.follow_user, {
    onDelete: 'CASCADE',
  })
  followers: Follows[];

  @OneToMany(() => Follows, (following) => following.following_user, {
    onDelete: 'CASCADE',
  })
  followings: Follows[];

  @OneToMany(() => Scores, (score) => score.user, { onDelete: 'CASCADE' })
  scores: Scores[];

  @OneToMany(() => MaydayRecords, (record) => record.user_record, {
    onDelete: 'CASCADE',
  })
  user_record: MaydayRecords[];

  @OneToMany(() => MaydayRecords, (record) => record.helper_record, {
    onDelete: 'CASCADE',
  })
  helper_record: MaydayRecords[];

  @OneToMany(() => NotificationMessages, (message) => message.user, {
    onDelete: 'CASCADE',
  })
  messages: NotificationMessages[];

  @OneToOne(() => Location, (location) => location.user, {
    onDelete: 'CASCADE',
  })
  location: Location;
}
