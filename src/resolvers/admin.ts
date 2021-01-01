import { Admin } from "../entities/Admin";
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
import { AdminInput, ErrorField, MyContext } from "../types";
import { verify as argonVerify, hash as argonHash } from "argon2";
import { validateAdminData } from "../utils/validateAdminData";
import { getConnection } from "typeorm";
import { Organization } from "../entities/Organization";
import { isAuth } from "../middleware/isAuth";
import { cookieName } from "../constants";

@ObjectType()
class LoginResponse {
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
  @Field(() => Admin, { nullable: true })
  admin?: Admin;
}

@Resolver(Admin)
export class AdminResolver {
  @Query(() => Admin, { nullable: true })
  heartBeat(@Ctx() { req }: MyContext) {
    const { admin } = req.session;
    console.log(admin);
    if (!admin?.id) return null;
    return admin;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<LoginResponse> {
    const admin = await Admin.findOne({
      relations: ["organization"],
      where: { username }
    });
    if (admin && admin.isActive) {
      const isValid = await argonVerify(admin.password, password);
      if (isValid) {
        req.session.admin = {
          firstName: admin.firstName,
          org: admin.organization.id,
          email: admin.email,
          lastName: admin.lastName,
          id: admin.id
        };
        return { admin };
      }
    }
    return {
      errors: [{ field: "", message: "datos incorrectos o usuario inactivo" }]
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(cookieName);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  @Mutation(() => LoginResponse)
  @UseMiddleware(isAuth)
  async register(
    @Arg("options", () => AdminInput) options: AdminInput
  ): Promise<LoginResponse> {
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
