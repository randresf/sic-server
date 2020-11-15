import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
} from "typeorm";

import moment from "moment";
import { Reservation } from "./Reservation";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  citizenId: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  phone!: number;

  @CreateDateColumn()
  createdAt = moment.utc().format();

  @CreateDateColumn()
  updatedAt = moment.utc().format();

  @Column()
  email!: string;

  @Column()
  birthDate!: string;

  @OneToMany(() => Reservation, (reservation) => reservation.citizen)
  reservations: Reservation[];
}
