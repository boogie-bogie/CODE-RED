import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { MaydayRecords } from '../../mayday/entities/mayday-records.entity';

@Entity({ name: 'scores' })
export class Scores {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  score: number;

  @Column({ type: 'varchar', nullable: false })
  reason: string;

  // user_id
  @Column({ name: 'user_id', type: 'int', nullable: false })
  user_id: number;

  @ManyToOne(() => Users, (user) => user.scores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;

  // record_id
  @Column({ name: 'record_id', type: 'int', nullable: false })
  record_id: number;

  @OneToOne(() => MaydayRecords, (record) => record.score, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'record_id' })
  record: MaydayRecords;
}
