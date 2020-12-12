import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const { adminId } = context.req?.session;
  if (!adminId) {
    throw new Error("not authenticated");
  }
  return next();
};
