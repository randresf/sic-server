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
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.questions)
  citizen!: User;

  @Field()
  @Column()
  questionId!: string;

  @Field()
  @Column()
  questionText!: string;

  @Field()
  @Column()
  answer!: string;

  @CreateDateColumn()
  createdAt = moment.utc().format();

  @CreateDateColumn()
  updatedAt = moment.utc().format();
}
