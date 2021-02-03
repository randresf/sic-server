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
import { getConnection } from "typeorm";
import { Organization } from "../entities/Organization";
import { Place } from "../entities/Place";
import { isAuth } from "../middleware/isAuth";
import { ErrorField, MyContext, PlaceInput } from "../types";

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
    const { admin } = req.session;
    const org = await Organization.findOne(admin?.org);
    if (!org)
      return {
        errors: [
          {
            field: "organization",
            message: "no existe organization",
          },
        ],
      };

    if (!placeId) {
      const { name, address, jsonAddress, isActive } = data;
      const place = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Place)
        .values({ name, address, jsonAddress, isActive, owner: org })
        .returning("*")
        .execute();
      return {
        place: [place.raw[0]],
      };
    }

    const { name, address, isActive } = data;
    const update = await getConnection()
      .createQueryBuilder()
      .update(Place)
      .set({ name, address, isActive, owner: org })
      .where("id = :id", { id: placeId })
      .returning("*")
      .execute();
    return update.raw[0];
  }

  @Query(() => PlaceResponse)
  @UseMiddleware(isAuth)
  async getUserPlaces(@Ctx() { req }: MyContext): Promise<PlaceResponse> {
    const { admin } = req.session;
    console.log("session:", admin);
    let returning: PlaceResponse = {};
    try {
      const places = await Place.find({
        where: {
          owner: admin?.org,
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
            message: err.detail,
          },
        ],
      };
    }
    return returning;
  }

  @Mutation(() => PlaceResponse)
  @UseMiddleware(isAuth)
  async deletePlace(
    @Arg("placeId", () => String, { nullable: false }) placeId: string
  ): Promise<PlaceResponse> {
    const deletePlace = await Place.delete(placeId);
    if (deletePlace.affected === 0) {
      return { errors: [{ field: "PlaceId", message: "place not found" }] };
    }
    return { place: [] };
  }
}
