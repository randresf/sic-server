import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
  BeforeInsert,
  UpdateDateColumn
} from "typeorm";

import moment from "moment";
import { Reservation } from "./Reservation";
import { Field, ObjectType } from "type-graphql";
import { Question } from "./Questions";
import { v4 } from "uuid";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ unique: true })
  document: string;

  @Field()
  @Column()
  firstName!: string;

  @Field()
  @Column()
  lastName!: string;

  @Field()
  @Column({ type: "bigint" })
  phone!: number;

  @Field()
  @Column({ type: "bigint", nullable: true })
  contactNumber?: number;

  @Field()
  @Column({ type: String, nullable: true })
  emergenceContact?: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = moment.utc().format();

  @Field()
  @Column()
  email!: string;

  @Field()
  @Column()
  birthDate!: string;

  @OneToMany(() => Reservation, (reservation) => reservation.citizen, {
    cascade: true
  })
  reservations: Reservation[];

  @OneToMany(() => Question, (question) => question.user, { cascade: true })
  questions: Question[];

  @BeforeInsert()
  addId() {
    this.id = v4();
  }
}
