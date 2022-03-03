import { JwtPayload } from "jsonwebtoken";
import { UnauthUser } from "../entity/UnauthUser";
import { getKSTNow } from "./date";
import { verifyToken } from "./token";

export const getIsAdminAndSubByAccessToken: Function = async (
  token: string,
): Promise<{ isAdmin: boolean; sub: string }> => {
  const userTokens = verifyToken(token) as JwtPayload;

  let isAdmin = userTokens?.isAdmin ?? false;
  let userSubId = userTokens?.subId;
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
