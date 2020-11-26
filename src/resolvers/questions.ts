import { User } from "../entities/User";
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
    @Arg("questions", () => [QuestionType]) questions: [QuestionType],
    @Arg("userId", () => String) userId: string
  ): Promise<QuestionResponse> {
    const user = await User.findOne({ id: userId });
    if (!user) return { error: "usuario invalido" };
    let returning: QuestionResponse = {};
    try {
      questions.forEach(
        async (question) => await Question.insert({ ...question, user })
      );
      returning = { saved: true };
    } catch (error) {
      returning = { error: "ocurrio un error al guardar las respuestas" };
    }
    return returning;
  }
}
