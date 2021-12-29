import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";

import { AlgorithmStatusType } from "../DTO/algorithm.dto";
import { Emoji } from "./Emoji";

@Entity()
export class AlgorithmStatus {
  @PrimaryColumn({ default: "PENDING" })
  status: AlgorithmStatusType;

  @OneToMany("Algorithm", "algorithmStatus")
  @JoinColumn()
  postId: Algorithm[];
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

  @ManyToOne("AlgorithmStatus")
  @JoinColumn()
  algorithmStatus: AlgorithmStatus;

  @Column()
  algorithmStatusStatus: AlgorithmStatusType;
}

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  question: string;

  @Column()
  answer: string;
}
