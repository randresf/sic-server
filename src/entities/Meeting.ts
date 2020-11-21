import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
  BeforeInsert,
  JoinColumn,
} from "typeorm";

import moment from "moment";
import { Reservation } from "./Reservation";
import { v4 } from "uuid";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Meeting extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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
  @JoinColumn({ referencedColumnName: "meetingId" })
  reservations: Reservation[];

  @BeforeInsert()
  addId() {
    this.id = v4();
  }
}
