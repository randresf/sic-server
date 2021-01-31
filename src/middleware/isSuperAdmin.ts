import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isSuperAdmin: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorizationHeader = context.req.headers.authorization;
  console.log(authorizationHeader);
  if (!authorizationHeader) {
    throw new Error("not authenticated");
  }
  return next();
};
