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
import { UserResolver } from "./resolvers/user";
import { __isProd__ } from "./constants";
import path from "path";
// import { createReservationsLoader } from "./utils/createReservationsLoader";

const port = process.env.PORT || 4000;

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: process.env.DB_NAME,
    username: process.env.PG_USERNAME,
    password: process.env.PG_PWD || undefined,
    logging: !__isProd__,
    synchronize: true,
    entities: [User, Meeting, Reservation, Question],
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  await conn.runMigrations();

  const app = express();
  const schema = await buildSchema({
    resolvers: [MeetingResolver, QuestionResolver, UserResolver],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ res, req }) => ({
      req,
      res,
      //reservationsLoader: createReservationsLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`🚀 ready on port ${port} 🚀 `);
  });
};

main().catch(console.error);
