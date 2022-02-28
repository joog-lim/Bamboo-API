import { JwtPayload } from "jsonwebtoken";
import { getCustomRepository } from "typeorm";
import { UnauthUser } from "../entity/UnauthUser";

import { UserRepository } from "../repository/user";
import { getKSTNow } from "./date";
import { verifyToken } from "./token";

export const getIsAdminAndSubByAccessToken: Function = async (
  token: string,
  connectionName: string,
): Promise<{ isAdmin: boolean; sub: string }> => {
  const userTokens = verifyToken(token) as JwtPayload;

  let isAdmin = userTokens?.isAdmin ?? false;
  let userSubId;
  if (userTokens !== null) {
    const userRepo = getCustomRepository(UserRepository, connectionName);
    const user = await userRepo.getUserByEmail(userTokens.email);
    userSubId = user.subId;
  }
  return { isAdmin, sub: userSubId };
};

export const nowTimeisLeesthanUnauthUserExpiredAt: Function = (
  unauthUser: UnauthUser,
): boolean => {
  if (getKSTNow().getTime() < unauthUser.expiredAt.getTime()) {
    return true;
  }
  return false;
};
