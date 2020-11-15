import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  BaseEntity,
} from "typeorm";

import moment from "moment";
import { User } from "./User";
import { Meeting } from "./meeting";

@Entity()
export class Reservation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reservations)
  citizen!: User;

  @ManyToOne(() => Meeting, (m) => m.reservations)
  meeting: Meeting;

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
}
