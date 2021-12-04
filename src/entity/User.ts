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
export class AccessTokenByUser {
  @PrimaryColumn()
  token: string;

  @Column()
  createdAt: String;

  @Column()
  refreshedAt: string;

  @Column()
  expiredAt: string;
}

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

  @OneToOne("AccessTokenByUser")
  @JoinColumn()
  accessToken: AccessTokenByUser;

  @Column({ type: "boolean" })
  isAdmin: boolean;

  @OneToMany(() => Emoji, (emoji) => emoji.user)
  emojis: Emoji[];
}
