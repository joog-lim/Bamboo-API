import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
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

  @Column({ type: "boolean" })
  isStudent: boolean;

  @CreateDateColumn()
  signUpTime: Date;

  @Column({ type: "boolean" })
  isAdmin: boolean;

  @OneToMany(() => Emoji, (emoji) => emoji.user)
  emojis: Emoji[];
}
