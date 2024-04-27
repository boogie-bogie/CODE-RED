import { Users } from 'webapp/src/common/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'direct_messages' })
export class DirectMessages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  roomName: string;

  @Column({ type: 'varchar', nullable: false })
  message: string;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @CreateDateColumn()
  created_at: Date;

  // @ManyToOne(() => Users, (user) => user.dms, {
  //   onDelete: 'NO ACTION',
  // })
  // @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  // user: Users;
}
