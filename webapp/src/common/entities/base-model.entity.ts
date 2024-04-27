import {
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from "typeorm";
  
  export abstract class BaseModel {
    @PrimaryGeneratedColumn()
    id: number;
  
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

  }
