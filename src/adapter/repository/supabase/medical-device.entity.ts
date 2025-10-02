import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("medical_devices")
export class MedicalDeviceEntity {
  @PrimaryGeneratedColumn("uuid")
  deviceId: string;

  @Column()
  serial: string;

  @Column()
  brand: string;

  @Column()
  model: string;

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
