import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware
} from "type-graphql";
import { createQueryBuilder, getConnection } from "typeorm";
import { Meeting } from "../entities/Meeting";
import { ErrorField, MyContext } from "../types";
//import moment from "moment";
import { isAuth } from "../middleware/isAuth";
import { Place } from "../entities/Place";
import { Reservation } from "../entities/Reservation";

const MEETING_UPDATED = "meeting_updated";
const MEETING_DELETED = "meeting_deleted";
const NEW_MEETING = "new_meeting";
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

@ObjectType()
class PaginatedMeetings {
  @Field(() => [Meeting])
  meetings: Meeting[];
  @Field()
  hasMore: Boolean;
}

@ObjectType()
class MeetingUpdated {
  @Field()
  data: Meeting;
}

@ObjectType()
class MeetingDeleted {
  @Field()
  data: String;
}

@Resolver(Meeting)
export class MeetingResolver {
  @Subscription({ topics: MEETING_UPDATED })
  meetingUpdated(@Root() reservationPayload: MeetingUpdated): MeetingUpdated {
    return reservationPayload;
  }

  @Subscription({ topics: NEW_MEETING })
  newMeeting(@Root() reservationPayload: MeetingUpdated): MeetingUpdated {
    return reservationPayload;
  }

  @Subscription({ topics: MEETING_DELETED })
  meetingDelete(@Root() reservationPayload: MeetingDeleted): MeetingDeleted {
    return reservationPayload;
  }

  @Query(() => PaginatedMeetings)
  async meetings(
    @Ctx() { req }: MyContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedMeetings> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const { admin } = req.session;
    const qb = createQueryBuilder("meeting", "meeting")
      .leftJoinAndSelect(
        "meeting.place",
        "place",
        'place.id = meeting."placeId"'
      )
      .orderBy("meeting.createdAt", "ASC") // postgress need quotes
      .take(realLimitPlusOne);

    if (cursor) {
      qb.where('meeting."createdAt" > :cursor', {
        cursor: new Date(parseInt(cursor))
      });
      if (!admin?.id)
        qb.andWhere('meeting."isActive" = :value', { value: true });
    } else if (!admin?.id)
      qb.where('meeting."isActive" = :value', { value: true });

    const meetings = await qb.getMany();
    return {
      meetings: meetings.slice(0, realLimit) as Meeting[],
      hasMore: meetings.length === realLimitPlusOne
    };
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
    @PubSub() pubSub: PubSubEngine,
    @Arg("meetingId", () => String, { nullable: true }) meetingId?: string
  ): Promise<MeetingRes> {
    const place = await Place.findOne(data.place);
    if (!place)
      return { errors: [{ field: "place", message: "place not found" }] };
    const { hasReservation, ...rest } = data;
    if (!meetingId) {
      const meeting = await Meeting.create({
        ...rest,
        place,
        meetingDate: new Date(data.meetingDate)
      }).save();
      await pubSub.publish(NEW_MEETING, {
        data: { ...meeting, place, hasReservation: false }
      });
      return {
        meeting
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
      .set({ ...rest, place })
      .where("id = :id", { id: meetingId })
      .returning("*")
      .execute();
    const meetingUpdated = update.raw[0];
    const subMeeting = {
      ...meetingUpdated,
      hasReservation: false,
      place
    };
    await pubSub.publish(MEETING_UPDATED, {
      data: subMeeting
    });
    if (String(meeting.isActive) !== String(meetingUpdated.isActive))
      await pubSub.publish(NEW_MEETING, {
        data: subMeeting
      });
    return { meeting: meetingUpdated };
  }

  @Mutation(() => MeetingRes)
  @UseMiddleware(isAuth)
  async deleteMeeting(
    @PubSub() pubSub: PubSubEngine,
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
    await pubSub.publish(MEETING_DELETED, {
      data: meetingId
    });
    return { meeting: null };
  }
}
