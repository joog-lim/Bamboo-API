import { JwtPayload } from "jsonwebtoken";
import { getCustomRepository } from "typeorm";

import { UserRepository } from "../repository/user";
import { verifyToken } from "./token";

export const getIsAdminAndSubByAccessToken: Function = async (
  token: string,
  connectionName: string
) => {
  const userTokens = verifyToken(token) as JwtPayload;

  let isAdmin = userTokens.isAdmin ?? false;
  let userSubId;

  if (userTokens !== null) {
    const userRepo = getCustomRepository(UserRepository, connectionName);
    const user = await userRepo.getUserByEmail(userTokens.email);
    userSubId = user.subId;
  }

  return { isAdmin, sub: userSubId };
};
