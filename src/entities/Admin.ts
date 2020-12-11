import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  BeforeInsert,
  UpdateDateColumn,
  ManyToOne
} from "typeorm";

import moment from "moment";
import { v4 } from "uuid";
import { Field, ObjectType } from "type-graphql";
import { Organization } from "./Organization";

@ObjectType()
@Entity()
export class Admin extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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
  @Column()
  email!: string;

  @Field()
  @Column()
  username!: string;

  @Field(() => String)
  @Column()
  password!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = moment.utc().format();

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Organization, (res) => res.admins)
  organization!: Organization;

  @BeforeInsert()
  addId() {
    this.id = v4();
  }
}
