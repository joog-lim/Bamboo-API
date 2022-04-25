import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Algorithm } from "./Algorithm";

@Entity()
export class ReportAlgorithm {
  @PrimaryGeneratedColumn()
  idx!: number;

  @ManyToOne(() => User, (user) => user.reportAlgorithm, {
    onDelete: "CASCADE",
  })
  user!: User;

  @ManyToOne(() => Algorithm, (algorithm) => algorithm.reportAlgorithm, {
    onDelete: "CASCADE",
  })
  algorithm!: Algorithm;
}
