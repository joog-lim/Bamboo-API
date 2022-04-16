import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

import { issuer } from "../config";
import {
  AccessTokenDTO,
  RefreshTokenDTO,
  TokenDataTypeList,
  TokenType,
} from "../DTO/token.dto";

export const verifyToken = <T extends AccessTokenDTO | RefreshTokenDTO>(
  token: string,
): T | undefined => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "joog-lim.info") as T;
  } catch (e: unknown) {
    console.error(e);
    return undefined;
  }
};

const tokenExpiresIn: { [k in TokenType]: string | number } = {
  AccessToken: "1h",
  RefreshToken: "30d",
};

export const generateToken = <
  TokenTypes extends TokenType,
  TokenData extends TokenDataTypeList[TokenTypes],
>(
  tokenType: TokenTypes,
  data: TokenData,
) =>
  jwt.sign({ ...data, tokenType }, process.env.JWT_SECRET || "joog-lim.info", {
    expiresIn: tokenExpiresIn[tokenType],
    issuer,
  });
