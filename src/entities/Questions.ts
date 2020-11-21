import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  BaseEntity,
  PrimaryColumn,
} from "typeorm";

import moment from "moment";
import { User } from "./User";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Field()
  @PrimaryColumn()
  citizenId: string;

  @ManyToOne(() => User, (user) => user.questions)
  citizen!: User;

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
}
