import { Arg, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { Question } from "../entities/Questions";

@InputType()
class QuestionInput {
  @Field()
  questionId!: string;
  @Field()
  questionText!: string;
  @Field()
  answer!: string;
}

@Resolver(Question)
export class QuestionResolver {
  @Query(() => [Question])
  async questions(): Promise<Question[]> {
    const question = await Question.find({});
    return question;
  }

  @Mutation(() => Question)
  async registrerQuestion(@Arg("data") data: QuestionInput): Promise<Question> {
    return Question.create({ ...data }).save();
  }
}
