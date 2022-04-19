import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Emoji } from "./Emoji";
import { ReportAlgorithm } from "./Reportalgorithm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  subId!: string;

  @Column()
  email!: string;

  @Column()
  pw!: string;

  @Column()
  nickname!: string;

  @Column()
  generation!: number;

  @CreateDateColumn()
  signUpTime!: Date;

  @Column()
  stdGrade!: number;

  @Column()
  stdClass!: number;

  @Column()
  stdNumber!: number;

  @Column({ type: "boolean", default: false })
  isAdmin!: boolean;

  @OneToMany(() => Emoji, (emoji) => emoji.user, { cascade: true })
  emojis?: Emoji[];

  @OneToMany(() => ReportAlgorithm, (report) => report.user, { cascade: true })
  reportAlgorithm?: ReportAlgorithm[];
}
