import { InputType, Field, ObjectType } from "type-graphql";

@InputType()
export class UserInput {
  @Field()
  citizenId: string;

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

@ObjectType()
export class ErrorField {
  @Field()
  field: string;
  @Field()
  message: string;
}
