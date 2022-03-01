import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UnauthUser {
  @PrimaryColumn()
  subId: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  authenticationNumber: string;

  @Column({ type: "datetime", nullable: true })
  expiredAt: Date;
}
