import { User } from "../entities/User";
import {
  Arg,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { ErrorField, UserInput } from "./types";
import { validateRegister } from "../utils/validateRegister";
import { Reservation } from "../entities/Reservation";
import { InputType } from "type-graphql";

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
  @Field()
  userId?: string;
}

@InputType()
class userContactType {
  @Field()
  contactNumber!: number;
  @Field()
  emergenceContact!: string;
}

@InputType()
// @ObjectType()
// class ReservationResponse {
//   @Field(() => [Reservation])
//   reservations?: Reservation[] | null;
// }

@Resolver(User)
export class UserResolver {
  @Mutation(() => UserResponse)
  async user(
    @Arg("document", () => String) document: string
  ): Promise<UserResponse> {
    const user = await User.findOne({ document });
    if (!user)
      return { errors: [{ field: "document", message: "usuario no existe" }] };
    return { user };
  }

  @FieldResolver(() => [Reservation] || null)
  reservations(@Root() user: User) {
    return Reservation.find({ where: { userId: user.id } });
  }

  @Query(() => UserResponse)
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
  async saveUser(
    @Arg("data", () => UserInput) data: UserInput,
    @Arg("userId", () => String, { nullable: true }) userId?: string
  ): Promise<UserResponse> {
    const errors = validateRegister(data);
    if (errors && errors.length > 0) return { errors };
    let returning: UserResponse = {};
    try {
      if (userId) {
        const user = await User.update(
          { id: userId, document: data.document },
          { ...data }
        );
        returning = {
          user: { id: userId, ...user.raw[0] },
        };
      } else {
        returning = { user: await User.create({ ...data }).save() };
      }
    } catch (err) {
      if (err.message.includes("duplicate key value violates")) {
        returning = { errors: [{ field: "", message: "documento ya existe" }] };
      } else returning = { errors: [{ field: "", message: err.message }] };
    }
    return returning;
  }

  @Mutation(() => UserResponse)
  async updateContactUser(
    @Arg("userId", () => String) userId: string,
    @Arg("contactData", () => userContactType) contactData: userContactType
  ): Promise<UserResponse> {
    let returning: UserResponse = {};
    try {
      await User.update({ id: userId }, { ...contactData });

      returning = {
        userId,
      };
    } catch (err) {
      returning = {
        errors: [{ field: "", message: "Error al actualizar el usaurio" }],
      };
    }
    return returning;
  }
}
