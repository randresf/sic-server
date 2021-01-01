import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from "type-graphql";
import { getConnection } from "typeorm";
import { Meeting } from "../entities/Meeting";
import { ErrorField, MyContext } from "../types";
//import moment from "moment";
import { isAuth } from "../middleware/isAuth";
import { Place } from "../entities/Place";
import { Reservation } from "../entities/Reservation";

@InputType()
class MeetingInput {
  @Field({ nullable: true })
  id?: string;
  @Field()
  title!: string;
  @Field()
  spots!: number;
  @Field()
  meetingDate!: string;
  @Field({ nullable: true })
  hasReservation?: boolean;
  @Field()
  place!: string;
  @Field()
  isActive!: string;
}

@ObjectType()
class MeetingRes {
  @Field(() => Meeting, { nullable: true })
  meeting?: Meeting | Meeting[] | null;
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@Resolver(Meeting)
export class MeetingResolver {
  @Query(() => [Meeting])
  async meetings(@Ctx() { req }: MyContext): Promise<Meeting[]> {
    const { admin } = req.session;
    // const today = moment().subtract(1, "d");
    // const nextWeek = moment().add(7, "d");
    const other = admin?.id
      ? {}
      : {
          isActive: true
          // meetingDate: Raw(
          //   (alias) =>
          //     `${alias} > '${today.format(
          //       "YYYY-MM-DD"
          //     )}' AND ${alias} < '${nextWeek.format("YYYY-MM-DD")}'`
          // ),
        };
    const meeting = await Meeting.find({
      relations: ["place"],
      where: {
        ...other
      },
      order: {
        meetingDate: "ASC"
      }
    });
    return meeting;
  }

  @FieldResolver(() => Boolean)
  async hasReservation(@Root() meeting: Meeting) {
    const res = await Reservation.findOne({ meetingId: meeting.id });
    return Boolean(res);
  }

  @FieldResolver(() => Place || null)
  place(@Root() meeting: Meeting) {
    return meeting.place;
  }

  @Query(() => MeetingRes)
  async meeting(@Arg("id") id: string): Promise<MeetingRes> {
    const meeting = await Meeting.findOne({ id });
    if (!meeting)
      return { errors: [{ field: "", message: "meeting not found" }] };
    return { meeting };
  }

  @Query(() => [Meeting])
  async meetingsById(
    @Arg("ids", () => [String]) ids: string[]
  ): Promise<Meeting[]> {
    const meeting = await Meeting.findByIds(ids);
    return meeting;
  }

  @Mutation(() => MeetingRes)
  @UseMiddleware(isAuth)
  async saveMeeting(
    @Arg("data") data: MeetingInput,
    @Arg("meetingId", () => String, { nullable: true }) meetingId?: string
  ): Promise<MeetingRes> {
    const place = await Place.findOne(data.place);
    if (!place)
      return { errors: [{ field: "place", message: "place not found" }] };
    if (!meetingId) {
      return {
        meeting: await Meeting.create({
          ...data,
          place,
          meetingDate: new Date(data.meetingDate)
        }).save()
      };
    }
    const thereIsReservation = await Reservation.findOne({
      meetingId
    });
    if (thereIsReservation) {
      return {
        errors: [
          {
            field: "reservation",
            message: "exist reservation whit this meeting"
          }
        ]
      };
    }
    const meeting = await Meeting.findOne({ id: meetingId });
    if (!meeting)
      return { errors: [{ field: "meetingId", message: "meeting not found" }] };
    const update = await getConnection()
      .createQueryBuilder()
      .update(Meeting)
      .set({ ...data, place })
      .where("id = :id", { id: meetingId })
      .returning("*")
      .execute();
    return update.raw[0];
  }

  @Mutation(() => MeetingRes)
  @UseMiddleware(isAuth)
  async deleteMeeting(
    @Arg("meetingId", () => String, { nullable: true }) meetingId: string
  ): Promise<MeetingRes> {
    const thereIsReservation = await Reservation.findOne({
      meetingId
    });
    if (thereIsReservation)
      return {
        errors: [
          {
            field: "reservation",
            message: "exist reservation whit this meeting"
          }
        ]
      };
    const deleteMeeting = await Meeting.delete(meetingId);
    if (!deleteMeeting) {
      return { errors: [{ field: "meetingId", message: "meeting not found" }] };
    }
    return { meeting: null };
  }
}
