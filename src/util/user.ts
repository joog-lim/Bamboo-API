import { JwtPayload } from "jsonwebtoken";
import { getCustomRepository } from "typeorm";

import { UserRepository } from "../repository/user";
import { verifyToken } from "./token";

export const getIsAdminAndSubByAccessToken: Function = async (
  token: string
) => {
  const userTokens = verifyToken(token) as JwtPayload;

  let isAdmin = false;
  let userSubId;

  if (userTokens !== null) {
    const userRepo = getCustomRepository(UserRepository);
    const user = await userRepo.getUserByEmail(userTokens.email);
    isAdmin = user.isAdmin;
    userSubId = user.subId;
  }

  return { isAdmin, sub: userSubId };
};
