import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Users } from "./users.entity";

  @Entity({ name: "follows" })
  export class Follows {

    @PrimaryGeneratedColumn()
    id: number;

    //follower_id
    @Column({ name: "follower_id", type: 'int', nullable: false })
    follower_id: number;

    @ManyToOne(() => Users, (user) => user.followers, {
    onDelete: "CASCADE",
    })
    @JoinColumn({ name: "follower_id", referencedColumnName: "id" })
    follow_user: Users;

    //following_id
    @Column({ name: "following_id", type: 'int', nullable: false })
    following_id: number;

    @ManyToOne(() => Users, (user) => user.followings, {
    onDelete: "CASCADE",
    })
    @JoinColumn({ name: "following_id",   referencedColumnName: "id" })
    following_user: Users;


  }