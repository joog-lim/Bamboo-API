import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Algorithm } from "./Algorithm";

@Entity()
export class Emoji {
  @PrimaryGeneratedColumn()
  emojiStatus: string;

  @ManyToOne(() => User, (user) => user.emojis)
  user: User;

  @ManyToOne(() => Algorithm, (algorithm) => algorithm.emojis)
  algorithem: Algorithm;
}
