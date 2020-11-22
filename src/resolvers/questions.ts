import {
  Arg,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  ObjectType,
} from "type-graphql";
import { Question } from "../entities/Questions";

@ObjectType()
class QuestionResponse {
  @Field()
  error?: string;
  @Field()
  saved?: boolean;
}

@InputType()
class QuestionType {
  @Field()
  UserId!: string;
  @Field()
  questionId!: string;
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

  @Mutation(() => QuestionResponse)
  async registrerQuestion(
    @Arg("questions", () => [QuestionType]) questions: [QuestionType]
  ): Promise<QuestionResponse> {
    console.log(questions);
    try {
      await Question.insert(questions);

      return { saved: true };
    } catch (error) {
      return { error };
    }
  }
}
