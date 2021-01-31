import { Admin } from "../entities/Admin";
import { AdminOutput, ErrorField } from "../types";
import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver
} from "type-graphql";
import { Organization } from "../entities/Organization";
import Str from "@supercharge/strings";
import { hash as argonHash } from "argon2";

@InputType()
class AddOrgType {
  @Field()
  name: string;
  @Field()
  username: string;
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
            message: "not authenticated"
          }
        ]
      };
    const { username, ...orgData } = data;
    try {
      const org = (await Organization.insert(orgData)).raw[0];
      const password = Str.random(5);
      const hashedPwd = await argonHash(password);
      const defaultAdmin = {
        firstName: Str.random(5),

        lastName: Str.random(5),

        phone: 1234567,

        email: `${Str.random(5)}@email.com`,

        username,

        password: hashedPwd
      };
      const adminInsert = (
        await Admin.insert({
          ...defaultAdmin,
          organization: org
        })
      ).raw[0];

      return {
        org: {
          ...org,
          defaultAdmin: { id: adminInsert.id, username, password }
        }
      };
    } catch (e) {
      return {
        errors: [
          {
            field: "error",
            message: e
          }
        ]
      };
    }
  }
}
