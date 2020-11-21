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
  citizenId: string;

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
  @CreateDateColumn()
  updatedAt = moment.utc().format();

  @Field()
  @Column()
  email!: string;

  @Field()
  @Column()
  birthDate!: string;

  @OneToMany(() => Reservation, (reservation) => reservation.citizen)
  @JoinColumn({ referencedColumnName: "userId" })
  reservations: Reservation[];

  @OneToMany(() => Question, (question) => question.citizen)
  @JoinColumn({ referencedColumnName: "citizenId" })
  questions: Question[];

  @BeforeInsert()
  addId() {
    this.id = v4();
  }
}
