import { User } from "../entities/User";
import { Arg, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import { ErrorField, UserInput } from "./types";
import { validateRegister } from "../utils/validateRegister";

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@Resolver(User)
export class UserResolver {
  @Mutation(() => UserResponse)
  async user(
    @Arg("citizenId", () => String) citizenId: string
  ): Promise<UserResponse> {
    const user = await User.findOne({ citizenId });
    if (!user)
      return { errors: [{ field: "citizenId", message: "usuario no existe" }] };
    return { user };
  }

  @Mutation(() => UserResponse)
  async userById(
    @Arg("userId", () => String) userId: string
  ): Promise<UserResponse> {
    const user = await User.findOne({ id: userId });
    if (!user)
      return { errors: [{ field: "userId", message: "usuario no existe" }] };
    return { user };
  }

  @Mutation(() => UserResponse)
  async createUser(
    @Arg("data", () => UserInput) data: UserInput
  ): Promise<UserResponse> {
    const errors = validateRegister(data);
    if (errors && errors.length > 0) return { errors };
    return { user: await User.create({ ...data }).save() };
  }

  @Mutation(() => UserResponse)
  async updateUser(
    @Arg("data", () => UserInput) data: UserInput,
    @Arg("userId", () => String) userId: string
  ): Promise<UserResponse> {
    const errors = validateRegister(data);
    if (errors && errors.length > 0) return { errors };
    let returning: UserResponse = {};
    try {
      const user = (await User.update({ id: userId }, { ...data })).raw[0];
      returning = {
        user,
      };
    } catch (err) {
      console.log(err);
      returning = { errors: [{ field: "", message: err.message }] };
    }
    return returning;
  }
}
