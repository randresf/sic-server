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
  @Field(() => String, { nullable: true })
  error?: string;
  @Field(() => Boolean, { nullable: true })
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
    let returning;
    try {
      const adduserr = questions.map((q) => ({ ...q, user }));
      await Question.insert(adduserr);
      returning = { saved: true };
    } catch (error) {
      returning = { error: "ocurrio un error al guardar las respuestas" };
    }
    return returning;
  }
}
