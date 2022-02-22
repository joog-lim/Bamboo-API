import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UnauthUser {
  @PrimaryColumn()
  subId: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: "int", nullable: true })
  authenticationNumber: number;

  @Column({ type: "datetime", nullable: true })
  expiredAt: Date;
}
