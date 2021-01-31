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
import { AdminInput, ErrorField, MyContext, userUpdateInput } from "../types";
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
  @Field(() => Admin || [Admin], { nullable: true })
  admin?: Admin | Admin[] | null;
}

@Resolver(Admin)
export class AdminResolver {
  @Query(() => Admin, { nullable: true })
  heartBeat(@Ctx() { req }: MyContext) {
    const { admin } = req.session;
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

  @Query(() => [Admin])
  @UseMiddleware(isAuth)
  async getAdminsData(@Ctx() { req }: MyContext): Promise<Admin[] | undefined> {
    const { admin } = req.session;

    const admins = await getConnection()
      .createQueryBuilder()
      .select()
      .from(Admin, "admin")
      .where("admin.organizationId = :org", { org: admin?.org })
      .execute();
    if (!admins) {
      return undefined;
    }
    return admins;
  }

  @Query(() => Admin)
  @UseMiddleware(isAuth)
  async getUserData(@Ctx() { req }: MyContext): Promise<Admin | undefined> {
    const { admin } = req.session;
    const userData = Admin.findOne({
      where: { id: admin?.id }
    });
    if (!userData) {
      return undefined;
    }
    return userData;
  }

  @Mutation(() => LoginResponse)
  @UseMiddleware(isAuth)
  async register(
    @Arg("options", () => AdminInput) options: AdminInput,
    @Ctx() { req }: MyContext
  ): Promise<LoginResponse> {
    const { admin } = req.session;
    const { ...adminData } = options;
    const org = await Organization.findOne(admin?.org);
    if (!org)
      return {
        errors: [{ field: "organizationId", message: "organizacion no existe" }]
      };
    const howManyAdmin = await Admin.find({
      where: {
        organization: admin?.org
      }
    });
    if (howManyAdmin.length >= 2) {
      return {
        errors: [
          { field: "Admin", message: "supera el numero de admin permitidos" }
        ]
      };
    }
    const errors = validateAdminData(adminData);
    if (errors) return { errors };
    const hashedPwd = await argonHash(options.password);
    let adminInfo;
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
      adminInfo = result.raw[0];
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [{ field: "username", message: "username already taken" }]
        };
      }
    }
    return { admin: adminInfo };
  }

  @Mutation(() => LoginResponse)
  @UseMiddleware(isAuth)
  async updateUser(
    @Ctx() { req }: MyContext,
    @Arg("userData", () => userUpdateInput) userData: userUpdateInput
  ): Promise<LoginResponse> {
    const { admin } = req.session;
    const { password, newPassword, ...data } = userData;
    const adminData = await Admin.findOne({
      relations: ["organization"],
      where: { id: admin?.id }
    });
    if (adminData) {
      if (password || newPassword) {
        const isValid = await argonVerify(adminData.password, password || "");
        if (!isValid) {
          return {
            errors: [{ field: "Password", message: "password is incorrect" }]
          };
        }
        const hashedPwd = await argonHash(newPassword || "");
        if (!hashedPwd) {
          return {
            errors: [
              {
                field: "Password",
                message: "password dont correct, please change"
              }
            ]
          };
        }
        const update = await getConnection()
          .createQueryBuilder()
          .update(Admin)
          .set({ ...data, password: hashedPwd })
          .where("id = :id", { id: admin?.id })
          .returning("*")
          .execute();
        return update.raw[0];
      }
    }
    const update = await getConnection()
      .createQueryBuilder()
      .update(Admin)
      .set({ ...data })
      .where("id = :id", { id: admin?.id })
      .returning("*")
      .execute();
    return update.raw[0];
  }
}
