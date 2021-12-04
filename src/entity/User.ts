import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { Emoji } from "./Emoji";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  subId: string;

  @Column()
  email: string;

  @Column()
  nickname: string;

  @Column({ type: "boolean" })
  isStudent: boolean;

  @CreateDateColumn()
  signUpTime: Date;

  @Column()
  accessToken: string;

  @Column()
  refreshedAt: string;

  @Column()
  expiredAt: string;

  @Column({ type: "boolean" })
  isAdmin: boolean;

  @OneToMany(() => Emoji, (emoji) => emoji.user)
  emojis: Emoji[];
}
