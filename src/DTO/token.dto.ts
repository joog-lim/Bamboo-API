import { JwtPayload } from "jsonwebtoken";
import { IdentityType } from "./user.dto";

export const TokenTypeList = {
  accessToken: "AccessToken",
  refreshToken: "RefreshToken",
} as const;

export type TokenType = typeof TokenTypeList[keyof typeof TokenTypeList];

export type BaseTokenDTO = {
  tokenType: TokenType;
} & JwtPayload;

export type AccessTokenArgumentDTO = {
  nickname: string;
  identity: IdentityType;
  isAdmin: boolean;
  email: string;
  subId: string;
};

export type RefreshTokenArgumentDTO = {
  email: string;
};

export interface TokenDataTypeList {
  AccessToken: AccessTokenArgumentDTO;
  RefreshToken: RefreshTokenArgumentDTO;
}

export type AccessTokenDTO = BaseTokenDTO & AccessTokenArgumentDTO;
export type RefreshTokenDTO = BaseTokenDTO & RefreshTokenArgumentDTO;
