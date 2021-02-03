import { ApolloServer } from "apollo-server-express";
import connecRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
//import { SubscriptionServer } from "subscriptions-transport-ws";
import { createServer } from "http";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
//import { execute, subscribe } from "graphql";
import { cookieName, __isProd__ } from "./constants";
import { AdminResolver } from "./resolvers/admin";
import { MeetingResolver } from "./resolvers/meeting";
import { OrganizationResolver } from "./resolvers/organization";
import { PlaceResolver } from "./resolvers/place";
import { QuestionResolver } from "./resolvers/questions";
import { ReservationResolver } from "./resolvers/reservation";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
// import { createReservationsLoader } from "./utils/createReservationsLoader";

const port = process.env.PORT || 4000;
const DBPROPS = {
  type: "postgres",
  logging: !__isProd__,
  synchronize: true,
  entities: [path.join(__dirname, "./entities/*")],
  migrations: [path.join(__dirname, "./migrations/*")],
};

const main = async () => {
  const conectionPorps = __isProd__
    ? { url: process.env.DATABASE_URL, ...DBPROPS }
    : {
        ...DBPROPS,
        database: process.env.DB_NAME,
        username: process.env.PG_USERNAME,
        password: process.env.PG_PWD || undefined,
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
      origin: ["http://localhost:3000", /aforo\.dev$/],
      credentials: true,
    })
  );

  if (__isProd__) app.set("trust proxy", 1);

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
      AdminResolver,
      PlaceResolver,
      OrganizationResolver,
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
