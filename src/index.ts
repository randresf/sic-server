import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { User } from "./entities/User";
import { Meeting } from "./entities/Meeting";
import { Reservation } from "./entities/Reservation";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MeetingResolver } from "./resolvers/meeting";
import { QuestionResolver } from "./resolvers/questions";
import { Question } from "./entities/Questions";

const port = process.env.PORT || 4000;

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "sic-server",
    username: "postgres",
    password: "admin",
    logging: true,
    synchronize: true,
    entities: [User, Meeting, Reservation, Question],
  });

  const app = express();
  const schema = await buildSchema({
    resolvers: [MeetingResolver, QuestionResolver],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
  });

  apolloServer.applyMiddleware({ app });

  app.listen(port, () => {
    console.log("🚀 ready on port 4000 🚀 ");
  });
};

main().catch(console.error);
