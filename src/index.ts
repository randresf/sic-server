import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { User } from "./entities/User";
import { Meeting } from "./entities/meeting";
import { Reservation } from "./entities/Reservation";

const port = process.env.PORT || 4000;

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "sic-server",
    username: "kath",
    logging: true,
    synchronize: true,
    entities: [User, Meeting, Reservation],
  });

  const app = express();

  app.listen(port, () => {
    console.log("🔥 ready on port 4000 🔥 ");
  });
};

main().catch(console.error);
