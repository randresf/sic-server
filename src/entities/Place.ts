import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  BeforeInsert,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

import moment from "moment";
import { v4 } from "uuid";
import { Field, ObjectType } from "type-graphql";
import { Organization } from "./Organization";
import { Meeting } from "./Meeting";

@ObjectType()
@Entity()
export class Place extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  address!: string;

  @Field(() => String)
  @Column()
  jsonAddress!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = moment.utc().format();

  @Field()
  @Column({ default: true })
  isActive: string;

  @ManyToOne(() => Organization, (res) => res.places)
  owner!: Organization;

  @OneToMany(() => Meeting, (res) => res.place)
  meetings!: Meeting[];

  @BeforeInsert()
  addId() {
    this.id = v4();
  }
}
