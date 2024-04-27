import { Column, Entity } from 'typeorm';
import { BaseModel } from './base-model.entity';

@Entity({ name: 'disaster_data' })
export class DisasterData extends BaseModel {
  @Column({ type: 'text', nullable: false })
  locationName: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({ type: 'varchar', nullable: false })
  send_platform: string;

  @Column({ type: 'timestamp', nullable: false })
  send_datetime: Date;
}
