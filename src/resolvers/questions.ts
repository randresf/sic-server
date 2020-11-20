import {
  Arg,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  ObjectType
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
  citizienId!: string;
  @Field()
  questionId!: string;
  @Field()
  answer!: string;
}

@InputType()
class QuestionInput {
  @Field(() => [QuestionType])
  questions!: QuestionType[];
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
    @Arg("questions") questions: [QuestionType]
  ): Promise<QuestionResponse> {
    const response = await Question.insert(questions);
    console.log(response);
    return { saved: true };
  }
}
