import { JwtPayload } from "jsonwebtoken";
import { getCustomRepository } from "typeorm";
import { UnauthUser } from "../entity/UnauthUser";
import { getKSTNow } from "./date";
import { verifyToken } from "./token";

export const getIsAdminAndEmailByAccessToken: Function = async (
  token: string,
): Promise<{ isAdmin: boolean; email: string }> => {
  const userTokens = verifyToken(token) as JwtPayload;
  return { isAdmin: userTokens?.isAdmin, email: userTokens?.email };
};

export const nowTimeisLeesthanUnauthUserExpiredAt: Function = (
  unauthUser: UnauthUser,
): boolean =>
  getKSTNow().getTime() < (unauthUser.expiredAt || getKSTNow()).getTime();
