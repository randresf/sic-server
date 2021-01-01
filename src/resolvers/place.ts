import { Organization } from "../entities/Organization";
import { isAuth } from "../middleware/isAuth";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Place } from "../entities/Place";
import { ErrorField, MyContext, PlaceInput } from "../types";
import { Admin } from "../entities/Admin";
import { getConnection } from "typeorm";

@ObjectType()
class PlaceResponse {
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
  @Field(() => [Place], { nullable: true })
  place?: Place[];
}

@Resolver(Place)
export class PlaceResolver {
  @Mutation(() => PlaceResponse)
  @UseMiddleware(isAuth)
  async addPlace(
    @Ctx() { req }: MyContext,
    @Arg("data") data: PlaceInput,
    @Arg("placeId", () => String, { nullable: true }) placeId?: string
  ): Promise<PlaceResponse> {
    const { adminId } = req.session;
    const orgData = await Admin.findOne({
      relations: ["organization"],
      where: { id: adminId },
    });
    if (!orgData)
      return {
        errors: [
          {
            field: "organizationData",
            message: "no existe organización para este usuario",
          },
        ],
      };
    const org = await Organization.findOne(orgData?.organization.id);
    if (!org)
      return {
        errors: [
          { field: "organizationId", message: "organizacion no existe" },
        ],
      };
    if (!placeId) {
      return { place: [await Place.create({ ...data, owner: org }).save()] };
    }
    const update = await getConnection()
      .createQueryBuilder()
      .update(Place)
      .where("id = :id", { id: placeId })
      .returning("*")
      .execute();
    return update.raw[0];
  }

  @Query(() => PlaceResponse)
  @UseMiddleware(isAuth)
  async getUserPlaces(@Ctx() { req }: MyContext): Promise<PlaceResponse> {
    const { adminId } = req.session;
    const admin = await Admin.findOne({
      relations: ["organization"],
      where: { id: adminId },
    });
    let returning: PlaceResponse = {};
    try {
      const places = await Place.find({
        where: {
          owner: admin?.organization,
          // isActive: true || false,
        },
      });

      returning = {
        place: places,
      };
    } catch (err) {
      returning = {
        errors: [
          {
            field: "",
            message: "Error al buscar los lugares relacionados con el usuario",
          },
        ],
      };
    }
    return returning;
  }

  @Mutation(() => PlaceResponse)
  async deletePlace(
    @Arg("placeId", () => String, { nullable: false }) placeId: string
  ): Promise<PlaceResponse> {
    const deletePlace = await Place.delete(placeId);
    console.log(deletePlace);
    if (deletePlace.affected === 0) {
      return { errors: [{ field: "PlaceId", message: "place not found" }] };
    }
    return { place: [] };
  }
}
