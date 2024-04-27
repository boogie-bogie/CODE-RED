import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseModel } from './base-model.entity';

@Entity({ name: 'clients' })
@Unique(['client_id'])
@Unique(['push_token'])
export class Clients extends BaseModel {
  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', nullable: false })
  client_id: string;

  @Column({ type: 'varchar', nullable: true })
  push_token: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;
}
