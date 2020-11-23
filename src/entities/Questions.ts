import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  BaseEntity,
  BeforeInsert,
  PrimaryGeneratedColumn,
} from "typeorm";

import moment from "moment";
import { User } from "./User";
import { v4 } from "uuid";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.questions)
  user!: User;

  @Field()
  @Column()
  questionId!: string;

  @Field()
  @Column()
  answer!: string;

  @CreateDateColumn()
  createdAt = moment.utc().format();

  @CreateDateColumn()
  updatedAt = moment.utc().format();

  @BeforeInsert()
  addId() {
    this.id = v4();
  }
}
