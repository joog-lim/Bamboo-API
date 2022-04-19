import { JwtPayload } from "jsonwebtoken";

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
  isAdmin: boolean;
  email: string;
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
