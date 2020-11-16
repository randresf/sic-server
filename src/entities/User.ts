import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
} from "typeorm";

import moment from "moment";
import { Reservation } from "./Reservation";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

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
  @Column()
  phone!: number;

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
  reservations: Reservation[];
}
