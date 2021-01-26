import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const { admin } = context.req?.session;
  if (!admin) {
    throw new Error("not authenticated");
  }
  return next();
};
