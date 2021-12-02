import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Algorithem } from "./Algorithem";

@Entity()
export class Emoji {
  @PrimaryGeneratedColumn()
  emojiStatus: string;

  @ManyToOne((type) => User, (user) => user.emojis)
  user: User;

  @ManyToOne((type) => Algorithem, (algorithem) => algorithem.emojis)
  algorithem: Algorithem;
}
