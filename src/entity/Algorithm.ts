import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  JoinColumn,
} from "typeorm";
import { Emoji } from "./Emoji";

@Entity()
export class AlgorithmStatus {
  @PrimaryColumn()
  status: string;
}

@Entity()
export class Algorithm {
  @PrimaryGeneratedColumn()
  postId: number;

  @Column({ type: "int" })
  postNumber: number;

  @Column()
  title: string;

  @Column({ length: 1000 })
  content: string;

  @Column()
  tag: string;

  @CreateDateColumn()
  postDate: Date;

  @OneToMany("Emoji", "algorithm")
  emojis: Emoji[];

  @OneToOne("AlgorithmStatus")
  @JoinColumn()
  algorithmStatus: AlgorithmStatus;
}

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column()
  answer: string;
}
