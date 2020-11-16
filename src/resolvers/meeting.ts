import { Arg, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { Meeting } from "../entities/Meeting"

@InputType()
class MeetingInput {
  @Field()
  title!: string;
  @Field()
  spots!: number;
  @Field()
  meetingDate!: string;
}

@Resolver(Meeting)
export class MeetingResolver {

  @Query(() => [Meeting])
  async meetings(): Promise<Meeting[]> {
    const meeting = await Meeting.find({})
    return meeting
  }

  @Mutation(() => Meeting)
  async createMeeting(
    @Arg("data") data: MeetingInput
  ): Promise<Meeting> {
    return Meeting.create({ ...data }).save()
  }
}