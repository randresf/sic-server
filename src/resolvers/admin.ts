import { Admin } from "src/entities/Admin";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware
} from "type-graphql";
import { AdminInput, ErrorField, MyContext } from "./types";
import { verify as argonVerify, hash as argonHash } from "argon2";
import { validateAdminData } from "src/utils/validateAdminData";
import { getConnection } from "typeorm";
import { Organization } from "src/entities/Organization";
import { isAuth } from "src/middleware/isAuth";

@ObjectType()
class LoginResponse {
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
  @Field(() => Admin, { nullable: true })
  admin?: Admin;
}

@Resolver(Admin)
export default class AdminResolver {
  @Query(() => Admin, { nullable: true })
  heartBeat(@Ctx() { req }: MyContext) {
    const { adminId } = req.session;
    if (!adminId) return null;
    return Admin.findOne(adminId);
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<LoginResponse> {
    const admin = await Admin.findOne({ username });
    if (admin) {
      const isValid = await argonVerify(admin.password, password);
      if (isValid) {
        req.session.adminId = admin.id;
        return { admin };
      }
    }
    return { errors: [{ field: "", message: "datos incorrectos" }] };
  }

  @Mutation(() => LoginResponse)
  @UseMiddleware(isAuth)
  async register(@Arg("options") options: AdminInput): Promise<LoginResponse> {
    const { organizationId, ...adminData } = options;
    const org = await Organization.findOne(organizationId);
    if (!org)
      return {
        errors: [{ field: "organizationId", message: "organizacion no existe" }]
      };
    const errors = validateAdminData(adminData);
    if (errors) return { errors };
    const hashedPwd = await argonHash(options.password);
    let admin;
    try {
      // User.create({opts}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Admin)
        .values({
          ...adminData,
          organization: org,
          password: hashedPwd
        })
        .returning("*")
        .execute();
      admin = result.raw[0];
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [{ field: "username", message: "username already taken" }]
        };
      }
    }
    return { admin };
  }
}
