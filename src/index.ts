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
//import { execute, subscribe } from "graphql";
import { __isProd__, cookieName } from "./constants";
import { MeetingResolver } from "./resolvers/meeting";
import { QuestionResolver } from "./resolvers/questions";
import { ReservationResolver } from "./resolvers/reservation";
import { UserResolver } from "./resolvers/user";
import { AdminResolver } from "./resolvers/admin";
import { PlaceResolver } from "./resolvers/place";
import { MyContext } from "./types";
//import { SubscriptionServer } from "subscriptions-transport-ws";
import { createServer } from "http";
// import { createReservationsLoader } from "./utils/createReservationsLoader";

const port = process.env.PORT || 4000;
const DBPROPS = {
  type: "postgres",
  logging: !__isProd__,
  synchronize: true,
  entities: [path.join(__dirname, "./entities/*")],
  migrations: [path.join(__dirname, "./migrations/*")]
};

const main = async () => {
  const conectionPorps = __isProd__
    ? { url: process.env.DATABASE_URL, ...DBPROPS }
    : {
        ...DBPROPS,
        database: process.env.DB_NAME,
        username: process.env.PG_USERNAME,
        password: process.env.PG_PWD || undefined
      };

  const conn = await createConnection(conectionPorps as any);

  //await Meeting.delete({})
  await conn.runMigrations();

  const ReduisStore = connecRedis(session);
  const redisClient = __isProd__
    ? new Redis(process.env.REDIS_URL)
    : new Redis();

  const app = express();

  app.use(
    cors({
      origin: ["localhost:3000", process.env.REACT_APP_URL || ""],
      credentials: true
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
        sameSite: "lax"
      },
      saveUninitialized: false,
      secret: process.env.SECRET_SESSION_KEY || "af0r0",
      resave: false
    })
  );

  const schema = await buildSchema({
    resolvers: [
      MeetingResolver,
      QuestionResolver,
      UserResolver,
      ReservationResolver,
      AdminResolver,
      PlaceResolver
    ],
    validate: false
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ res, req }): MyContext => ({
      req,
      res,
      redisClient
      //reservationsLoader: createReservationsLoader(),
    })
  });

  apolloServer.applyMiddleware({ app, cors: false });
  const server = createServer(app);
  apolloServer.installSubscriptionHandlers(server);
  server.listen(port, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`
    );
  });
};

main().catch(console.error);
