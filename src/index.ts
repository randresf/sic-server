import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import path from "path";
import Redis from "ioredis";
import connecRedis from "connect-redis";
import session from "express-session";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MeetingResolver } from "./resolvers/meeting";
import { QuestionResolver } from "./resolvers/questions";
import { ReservationResolver } from "./resolvers/reservation";
import { UserResolver } from "./resolvers/user";
import { __isProd__, cookieName } from "./constants";
import { MyContext } from "./resolvers/types";
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
    entities: [path.join(__dirname, "./entities/*")],
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  //await Meeting.delete({})
  await conn.runMigrations();

  const ReduisStore = connecRedis(session);
  const redisClient = new Redis();

  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: cookieName,
      store: new ReduisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: __isProd__,
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: process.env.SECRET_SESSION_KEY || "af0r0",
      resave: false,
    })
  );

  const schema = await buildSchema({
    resolvers: [
      MeetingResolver,
      QuestionResolver,
      UserResolver,
      ReservationResolver,
    ],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ res, req }): MyContext => ({
      req,
      res,
      redisClient,
      //reservationsLoader: createReservationsLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(port, () => {
    console.log(`🚀 ready on port ${port} 🚀 `);
  });
};

main().catch(console.error);
