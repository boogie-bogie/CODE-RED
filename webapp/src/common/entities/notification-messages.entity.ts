import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './base-model.entity';
import { NotificationStatus } from '../types/notification-status.type';
import { Users } from './users.entity';

@Entity({ name: 'notification_messages' })
export class NotificationMessages extends BaseModel {
  @Column({ type: 'int', nullable: true })
  user_id?: number;

  @Column({ type: 'varchar', nullable: true })
  client_id?: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    nullable: false,
    default: NotificationStatus.UnRead,
  })
  status: NotificationStatus;

  @ManyToOne(() => Users, (user) => user.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;
}
