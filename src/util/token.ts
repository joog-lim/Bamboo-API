import jwt, { JwtPayload } from "jsonwebtoken";

import { issuer } from "../config";
import { AccessTokenArgumentDTO } from "../DTO/user.dto";

export const verifyToken = (token: string): null | string | JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "joog-lim.info");
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const TokenTypeList = {
  accessToken: "AccessToken",
  refreshToken: "RefreshToken",
} as const;
export type TokenType = typeof TokenTypeList[keyof typeof TokenTypeList];
export const generateAccessToken = (data: AccessTokenArgumentDTO) =>
  jwt.sign(
    Object.assign({}, data, { tokenType: TokenTypeList.accessToken }),
    process.env.JWT_SECRET || "joog-lim.info",
    {
      expiresIn: "1h",
      issuer,
    },
  );

export const generateRefreshToken = (email: string) =>
  jwt.sign(
    { tokenType: TokenTypeList.refreshToken, email },
    process.env.JWT_SECRET || "joog-lim.info",
    {
      expiresIn: "30d",
      issuer,
    },
  );
