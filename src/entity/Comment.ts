import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Algorithm } from "./Algorithm";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.emojis, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Algorithm, (algorithm) => algorithm.emojis, {
    onDelete: "CASCADE",
  })
  algorithm: Algorithm;
}
