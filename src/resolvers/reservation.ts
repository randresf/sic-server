import { Reservation } from "../entities/Reservation";
import {
  Arg,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root
} from "type-graphql";
import { ErrorField } from "../types";
import { User } from "../entities/User";
import createQRWithAppLink from "../utils/createQrWithAppLink";
import { getConnection } from "typeorm";
import { Meeting } from "../entities/Meeting";
import moment from "moment";

@ObjectType()
class ReservationResponse {
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
  @Field(() => Reservation, { nullable: true })
  reservation?: Reservation;
}

@InputType()
class ReservationType {
  @Field()
  userId: string;
  @Field()
  meetingId: string;
}

@Resolver(Reservation)
export class ReservationResolver {
  @Mutation(() => ReservationResponse)
  async addReservation(
    @Arg("data", () => ReservationType) data: ReservationType
  ): Promise<ReservationResponse> {
    // check for user existence
    const user = await User.findOne({ id: data.userId });
    if (!user)
      return {
        errors: [{ field: "userId", message: "informacion incorrecta" }]
      };
    // check for previous reservations
    const userReservations = await Reservation.find({ userId: data.userId });
    if (userReservations.length > 3)
      return {
        errors: [
          {
            field: "reservations",
            message: "el usuario ya supero el limite de reservas"
          }
        ]
      };
    if (userReservations.find((r) => r.meetingId === data.meetingId))
      return {
        errors: [
          {
            field: "reservations",
            message: "el usuario ya reservo esta reunion"
          }
        ]
      };

    const meeting = await Meeting.findOne({ id: data.meetingId });
    if (!meeting)
      return {
        errors: [{ field: "meetingId", message: "informacion incorrecta" }]
      };

    if (meeting.spots === 0)
      return {
        errors: [
          { field: "meetingId", message: "no hay mas cupos disponibles" }
        ]
      };
    // all good, save

    const newReservation = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Reservation)
      .values([{ ...data, meeting, citizen: user }])
      .returning("id")
      .execute();
    const newReservationId = newReservation.raw[0].id;
    // create new QR
    const qrText = await createQRWithAppLink(
      `reservation/${newReservationId}?external=true`
    );
    const reserv = await getConnection()
      .createQueryBuilder()
      .update(Reservation)
      .set({ qrText })
      .where({ id: newReservationId })
      .returning("*")
      .execute();

    // update spots
    meeting.spots = meeting.spots > 0 ? meeting.spots - 1 : 0;
    await meeting.save();
    return { reservation: reserv.raw[0] };
  }

  @FieldResolver(() => User)
  async citizen(@Root() reser: Reservation) {
    return await User.findOne({ id: reser.userId });
  }

  @FieldResolver(() => Meeting)
  async meeting(@Root() reser: Reservation) {
    return await Meeting.findOne({ id: reser.meetingId });
  }

  @Query(() => ReservationResponse)
  async searchReservation(
    @Arg("reservationId", () => String) id: string
  ): Promise<ReservationResponse> {
    const reservation = await Reservation.findOne({ id });
    if (!reservation)
      return { errors: [{ field: "id", message: "reserva no existe" }] };
    return { reservation };
  }

  @Mutation(() => Boolean)
  async cancelReservation(
    @Arg("reservationId", () => String) id: string,
    @Arg("userId", () => String) userId: string
  ): Promise<Boolean> {
    const reservation = await Reservation.findOne({ id, userId });
    if (!reservation) return false;
    // update spots
    const meeting = await Meeting.findOne(reservation.meetingId);
    if (!meeting) return false;
    const canDelete = moment(meeting.meetingDate) > moment();
    if (!canDelete) return false;
    meeting.spots = meeting.spots + 1;
    await meeting.save();
    await reservation.remove();
    return true;
  }

  // @Mutation(() => Boolean)
  // async confirmReservation(
  //   @Arg("reservationId", () => String) id: string,
  //   @Arg("document", () => String) document: string
  // ): Promise<Boolean> {
  //   const reservation = await Reservation.findOne({ id, userId });
  //   if (!reservation) return false;
  //   // update spots
  //   const meeting = await Meeting.findOne(reservation.meetingId);
  //   if (!meeting) return false;
  //   meeting.spots = meeting.spots + 1;
  //   await meeting.save();
  //   await reservation.remove();
  //   return true;
  // }
}
