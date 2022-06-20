import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UnauthUser {
  @PrimaryGeneratedColumn("uuid")
  subId!: string;

  @Column({ nullable: false })
  email!: string;

  @Column({ nullable: true })
  authenticationNumber?: string;

  @Column({ type: "datetime", nullable: true })
  expiredAt?: Date;

  @Column({ type: "boolean", default: false })
  verified!: boolean;
}
