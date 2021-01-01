import { Request, Response } from "express";
import { Redis } from "ioredis";
// import { createReservationsLoader } from "../utils/createReservationsLoader";
import { InputType, Field, ObjectType } from "type-graphql";

// express-session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
  }
}

export type MyContext = {
  req: Request;
  res: Response;
  //reservationLoader: ReturnType<typeof createReservationsLoader>;
  redisClient: Redis;
};

@ObjectType()
export class ErrorField {
  @Field()
  field: string;
  @Field()
  message: string;
}

///////// INPUTS ///////

@InputType()
export class UserInput {
  @Field()
  document: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  phone!: number;

  @Field()
  email!: string;

  @Field()
  birthDate!: string;

  @Field({ nullable: true })
  emergenceContac?: string;

  @Field({ nullable: true })
  contactNumer?: number;
}

@InputType()
export class AdminInput {
  @Field()
  firstName!: string;
  @Field()
  lastName!: string;
  @Field()
  phone!: number;
  @Field()
  email!: string;
  @Field()
  username!: string;
  @Field()
  password!: string;
  @Field()
  organizationId?: string;
}

@InputType()
export class PlaceInput {
  @Field({ nullable: true })
  id?: string;

  @Field()
  name!: string;

  @Field()
  address!: string;

  @Field({ nullable: true })
  isActive!: string;
}
