import { BaseModel } from 'webapp/src/common/entities/base-model.entity';
import { Users } from 'webapp/src/common/entities/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'location' })
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'float', nullable: false })
  latitude: number;

  @Column({ type: 'float', nullable: false })
  longitude: number;

  @Column({ type: 'geometry', nullable: false })
  location: Point;

  @UpdateDateColumn()
  timestamp: Date;

  @OneToOne(() => Users, (user) => user.location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
