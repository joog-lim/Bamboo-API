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
  algorithm: Algorithm[];
}

@Entity()
export class Algorithm {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ type: "int" })
  algorithmNumber: number;

  @Column()
  title: string;

  @Column({ length: 1000 })
  content: string;

  @Column()
  tag: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany("Emoji", "algorithm")
  emojis: Emoji[];

  @ManyToOne("AlgorithmStatus")
  @JoinColumn()
  algorithmStatus: AlgorithmStatus;
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
