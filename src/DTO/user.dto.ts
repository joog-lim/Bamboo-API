import { JwtPayload } from "jsonwebtoken";

export type IdentityType = "faculty" | "graduate" | "student";
export type TokenType = "AccessToken" | "RefreshToken";

export type BaseTokenDTO = {
  tokenType: TokenType;
} & JwtPayload;

export type AccessTokenArgumentDTO = {
  nickname: string;
  identity: IdentityType;
  isAdmin: boolean;
  email: string;
};

export type RefreshTokenArgumentDTO = {
  email: string;
};

export type AccessTokenDTO = BaseTokenDTO & AccessTokenArgumentDTO;
export type RefreshTokenDTO = BaseTokenDTO & RefreshTokenArgumentDTO;
