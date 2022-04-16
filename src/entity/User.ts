import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  PrimaryColumn,
} from "typeorm";
import { Emoji } from "./Emoji";
import { ReportAlgorithm } from "./Reportalgorithm";

@Entity()
export class User {
  @PrimaryColumn()
  subId!: string;

  @Column()
  email!: string;

  @Column()
  nickname!: string;

  @Column()
  generation!: number;

  @CreateDateColumn()
  signUpTime!: Date;

  @Column({ type: "boolean", default: false })
  isAdmin!: boolean;

  @OneToMany(() => Emoji, (emoji) => emoji.user, { cascade: true })
  emojis?: Emoji[];

  @OneToMany(() => ReportAlgorithm, (report) => report.user, { cascade: true })
  reportAlgorithm?: ReportAlgorithm[];
}
