import { User } from "../entities/User";
import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { ErrorField, UserInput } from "./types";
import { validateRegister } from "../utils/validateRegister";

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
  async user(@Arg("citizenId", () => String) citizenId: string): Promise<UserResponse> {
    const user = await User.findOne({ citizenId });
    if (!user)
      return { errors: { field: "citizenId", message: "usuario no existe" } };
    return { user };
  }

  @Mutation(() => UserResponse)
  async createUser(@Arg("data", () => UserInput) data: UserInput): Promise<UserResponse> {
    const errors = validateRegister(data);
    if (errors) return { errors };
    return { user: await User.create({ ...data }).save() };
  }
}
