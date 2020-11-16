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
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Meeting extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  spots!: number;

  @Field()
  @Column()
  meetingDate!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @CreateDateColumn()
  updatedAt = moment.utc().format();

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Reservation, (res) => res.meeting)
  reservations: Reservation[];
}
