// this entity would be the top in the hierarchy
import moment from "moment";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { v4 } from "uuid";
import { Admin } from "./Admin";
import { Place } from "./Place";

@ObjectType()
@Entity()
export class Organization extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column({ unique: true })
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
