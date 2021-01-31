// this entity would be the top in the hierarchy
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
import { v4 } from "uuid";
import { Field, ObjectType } from "type-graphql";
import { Place } from "./Place";
import { Admin } from "./Admin";

@ObjectType()
@Entity()
export class Organization extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column()
  name!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = moment.utc().format();

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Place, (res) => res.owner)
  places: Place[];

  @OneToMany(() => Admin, (res) => res.organization)
  admins: Admin[];

  @BeforeInsert()
  addId() {
    this.id = v4();
  }
}
