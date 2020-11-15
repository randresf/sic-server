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
export class Meeting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  spots!: number;

  @Column()
  meetingDate!: string;

  @CreateDateColumn()
  createdAt = moment.utc().format();

  @CreateDateColumn()
  updatedAt = moment.utc().format();

  @Column()
  isActive: boolean;

  @OneToMany(() => Reservation, (res) => res.meeting)
  reservations: Reservation[];
}
