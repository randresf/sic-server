import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Meeting } from "../entities/Meeting";
import { ErrorField } from "./types";

@InputType()
class MeetingInput {
  @Field()
  title!: string;
  @Field()
  spots!: number;
  @Field()
  meetingDate!: string;
}

@ObjectType()
class MeetingRes {
  @Field(() => Meeting, { nullable: true })
  meeting?: Meeting | Meeting[];
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@Resolver(Meeting)
export class MeetingResolver {
  @Query(() => [Meeting])
  async meetings(): Promise<Meeting[]> {
    const meeting = await Meeting.find({});
    return meeting;
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

  @Mutation(() => Meeting)
  async createMeeting(@Arg("data") data: MeetingInput): Promise<Meeting> {
    return Meeting.create({ ...data }).save();
  }
}
