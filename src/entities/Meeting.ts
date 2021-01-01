import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
  BeforeInsert,
  JoinColumn,
  UpdateDateColumn,
  ManyToOne
} from "typeorm";

import moment from "moment";
import { Reservation } from "./Reservation";
import { v4 } from "uuid";
import { Field, ObjectType } from "type-graphql";
import { Place } from "./Place";

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

  @Field(() => Date)
  @Column()
  meetingDate!: Date;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = moment.utc().format();

  @Field()
  @Column({ default: false })
  isActive!: string;

  @OneToMany(() => Reservation, (res) => res.meeting)
  @JoinColumn({ referencedColumnName: "meetingId" })
  reservations: Reservation[];

  @ManyToOne(() => Place, (res) => res.meetings)
  place?: Place;

  @BeforeInsert()
  addId() {
    this.id = v4();
  }
}
