import { Organization } from "../entities/Organization";
import { isAuth } from "../middleware/isAuth";
import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Resolver,
  UseMiddleware
} from "type-graphql";
import { Place } from "../entities/Place";
import { ErrorField, PlaceInput } from "../types";

@ObjectType()
class PlaceResponse {
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
  @Field(() => Place, { nullable: true })
  place?: Place;
}

@Resolver(Place)
export class PlaceResolver {
  @Mutation(() => PlaceResponse)
  @UseMiddleware(isAuth)
  async addPlace(
    @Arg("idOrg") idOrg: string,
    @Arg("data") data: PlaceInput
  ): Promise<PlaceResponse> {
    const org = await Organization.findOne(idOrg);
    if (!org)
      return {
        errors: [{ field: "organizationId", message: "organizacion no existe" }]
      };
    return { place: await Place.create({ ...data, owner: org }).save() };
  }

  @Mutation(() => PlaceResponse)
  @UseMiddleware(isAuth)
  async updatePlace(
    @Arg("idPlace") idPlace: string,
    @Arg("data") data: PlaceInput
  ): Promise<PlaceResponse> {
    let returning: PlaceResponse = {};
    try {
      const updatePlace = await Place.update({ id: idPlace }, { ...data });
      returning = {
        place: { ...updatePlace.raw[0] }
      };
    } catch (err) {
      returning = {
        errors: [{ field: "", message: "Error al actualizar el lugar" }]
      };
    }
    return returning;
  }
}
