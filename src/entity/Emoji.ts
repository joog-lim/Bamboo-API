import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Algorithm } from "./Algorithm";

@Entity()
export class Emoji {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => User, (user) => user.emojis)
  user: User;

  @ManyToOne(() => Algorithm, (algorithm) => algorithm.emojis)
  algorithm: Algorithm;
}
