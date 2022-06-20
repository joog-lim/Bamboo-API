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
import { Comment } from "./Comment";
import { Emoji } from "./Emoji";
import { ReportAlgorithm } from "./Reportalgorithm";

@Entity()
export class AlgorithmStatus {
  @PrimaryColumn({ default: "PENDING" })
  status!: AlgorithmStatusType;

  @OneToMany("Algorithm", "algorithmStatus")
  @JoinColumn()
  algorithm?: Algorithm[];
}

@Entity()
export class Algorithm {
  @PrimaryGeneratedColumn()
  idx!: number;

  @Column({ type: "int" })
  algorithmNumber?: number;

  @Column()
  title!: string;

  @Column({ length: 1000 })
  content!: string;

  @Column()
  tag!: string;

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany("Emoji", "algorithm", { cascade: true })
  emojis!: Emoji[];

  @OneToMany("Comment", "algorithm", { cascade: true })
  comments!: Comment[];

  @OneToMany("ReportAlgorithm", "algorithm", { cascade: true })
  reportAlgorithm!: ReportAlgorithm[];

  @ManyToOne("AlgorithmStatus", { onDelete: "CASCADE" })
  @JoinColumn()
  algorithmStatus!: AlgorithmStatus;

  @Column()
  algorithmStatusStatus!: AlgorithmStatusType;
}

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  question!: string;

  @Column()
  answer!: string;
}
