import { User } from "../entities/User";
import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { UserInput } from "./types";
import { validateRegister } from "../utils/validateRegister";

@ObjectType()
class ErrorField {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => ErrorField, { nullable: true })
  errors?: ErrorField;
}

@Resolver(User)
export class UserResolver {
  @Query(() => UserResponse)
  async user(@Arg("citizenId") citizenId: string): Promise<UserResponse> {
    const user = await User.findOne({ citizenId });
    if (!user)
      return { errors: { field: "citizenId", message: "usuario no existe" } };
    return { user };
  }

  @Mutation(() => UserResponse)
  async createUser(@Arg("data") data: UserInput): Promise<UserResponse> {
    const errors = validateRegister(data);
    if (errors) return { errors };
    return { user: await User.create({ ...data }).save() };
  }
}
