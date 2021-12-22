import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  PrimaryColumn,
} from "typeorm";
import { Emoji } from "./Emoji";

@Entity()
export class User {
  @PrimaryColumn()
  subId: string;

  @Column()
  email: string;

  @Column()
  nickname: string;

  @Column()
  identity: string;

  @CreateDateColumn()
  signUpTime: Date;

  @Column({ type: "boolean", default: false })
  isAdmin: boolean;

  @OneToMany(() => Emoji, (emoji) => emoji.user)
  emojis: Emoji[];
}
