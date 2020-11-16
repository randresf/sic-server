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
import { Meeting } from "./Meeting";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Reservation extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reservations)
  citizen!: User;

  @ManyToOne(() => Meeting, (m) => m.reservations)
  meeting: Meeting;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @CreateDateColumn()
  updatedAt = moment.utc().format();

  @Field()
  @Column()
  qrText!: string;
}
