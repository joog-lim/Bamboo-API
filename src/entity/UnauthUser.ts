import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UnauthUser {
  @PrimaryColumn()
  subId: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: "int" })
  authenticationNumber: number;

  @Column({ type: "datetime" })
  expiredAt: Date;
}
