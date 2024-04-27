import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseModel } from '../../common/entities/base-model.entity';
import { Scores } from '../../common/entities/scores.entity';
import { Users } from '../../common/entities/users.entity';

@Entity({ name: 'mayday_records' })
export class MaydayRecords extends BaseModel {
  @Column({ type: 'decimal', nullable: true })
  distance: number;

  @Column({ type: 'text', nullable: false })
  context: string;

  @Column({ type: 'boolean', default: 'false', nullable: false })
  is_completed: boolean;

  // score
  @OneToOne(() => Scores, (score) => score.record)
  score: Scores;

  //user_id
  @Column({ name: 'user_id', type: 'int', nullable: false })
  user_id: number;

  @ManyToOne(() => Users, (user) => user.user_record, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user_record: Users;

  //helper_id
  @Column({ name: 'helper_id', type: 'int', nullable: true })
  helper_id: number;

  @ManyToOne(() => Users, (user) => user.helper_record, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'helper_id', referencedColumnName: 'id' })
  helper_record: Users;
}
