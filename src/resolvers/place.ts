import { isAuth } from "src/middleware/isAuth";
import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Place } from "../entities/Place";
import { ErrorField, placeInput } from "./types";

@ObjectType()
class PlaceResponse {
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
  @Field(() => Place, { nullable: true })
  place?: Place;
  @Field()
  idPlace?: string;
}

@Resolver(Place)
export default class PlaceResolver {
  @Mutation(() => PlaceResponse)
  @UseMiddleware(isAuth)
  async registrerPlace(@Arg("data") data: placeInput): Promise<PlaceResponse> {
    return { place: await Place.create({ ...data }).save() };
  }

  @Mutation(() => PlaceResponse)
  @UseMiddleware(isAuth)
  async updatePlace(
    @Arg("idPlace") idPlace: string,
    @Arg("data") data: placeInput
  ): Promise<PlaceResponse> {
    let returning: PlaceResponse = {};
    try {
      await Place.update({ id: idPlace }, { ...data });
      returning = {
        idPlace,
      };
    } catch (err) {
      returning = {
        errors: [{ field: "", message: "Error al actualizar el lugar" }],
      };
    }
    return returning;
  }
}
