import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("computers")
export class ComputerEntity {
  @PrimaryGeneratedColumn("uuid")
  deviceId: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  color: string;

  @Column()
  photoURL: string;

  @Column()
  owner: string;

  @Column({ type: "timestamptz", nullable: true })
  checkinAt?: Date;

  @Column({ type: "timestamptz", nullable: true })
  checkoutAt?: Date;

  @Column({ type: "timestamptz", default: () => "now()" })
  updatedAt: Date;
}
