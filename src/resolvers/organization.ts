import Str from "@supercharge/strings";
import { hash as argonHash } from "argon2";
import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Admin } from "../entities/Admin";
import { Organization } from "../entities/Organization";
import { AdminOutput, ErrorField } from "../types";

@InputType()
class AddOrgType {
  @Field()
  name: string;
  @Field()
  username: string;
  @Field()
  email: string;
  @Field({ nullable: true })
  logo?: string;
  @Field({ nullable: true })
  address?: string;
}

@ObjectType()
class OrgType {
  @Field()
  id: string;
  @Field()
  name: string;
  @Field(() => AdminOutput)
  defaultAdmin: AdminOutput;
}

@ObjectType()
class OrgResponse {
  @Field({ nullable: true })
  org?: OrgType;
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@ObjectType()
class OrgListResponse {
  @Field(() => [Organization] || Organization, { nullable: true })
  organization?: Organization[] | Organization;
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@ObjectType()
class OrgNameResponse {
  @Field(() => Organization, { nullable: true })
  organization?: Organization;
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@Resolver(Organization)
export class OrganizationResolver {
  @Mutation(() => OrgResponse)
  async addOrganization(
    @Arg("key") key: string,
    @Arg("data") data: AddOrgType
  ): Promise<OrgResponse> {
    if (key !== process.env.SUPERADMIN_KEY)
      return {
        errors: [
          {
            field: "superadminKey",
            message: "not authenticated",
          },
        ],
      };
    const { username, email, ...orgData } = data;
    try {
      const org = (await Organization.insert(orgData)).raw[0];
      const password = Str.random(8);
      const hashedPwd = await argonHash(password);
      const defaultAdmin = {
        firstName: Str.random(5),
        lastName: Str.random(5),
        phone: 1234567,
        email,
        username,
        password: hashedPwd,
      };
      const adminInsert = (
        await Admin.insert({
          ...defaultAdmin,
          organization: org,
        })
      ).raw[0];

      return {
        org: {
          id: org.id,
          name: orgData.name,
          defaultAdmin: { id: adminInsert.id, username, password },
        },
      };
    } catch (e) {
      return {
        errors: [
          {
            field: "error",
            message: e.detail,
          },
        ],
      };
    }
  }

  @Query(() => OrgListResponse)
  async getOrganizations(@Arg("id") id?: string): Promise<OrgListResponse> {
    const org = id ? await Organization.findOne(id) : await Organization.find();
    return { organization: org };
  }

  @Query(() => OrgNameResponse)
  async getOrganizationByName(
    @Arg("orgName") orgName: string
  ): Promise<OrgNameResponse> {
    const org = await Organization.findOne({ name: orgName });
    if (!org)
      return {
        errors: [
          {
            field: "orgName",
            message: "org no existe",
          },
        ],
      };
    return { organization: org };
  }
}
