export type IdentityType = "faculty" | "graduate" | "student";
export type TokenType = "AccessToken" | "RefreshToken";

export type BaseTokenDTO = {
  tokenType: TokenType;
};

export type AccessTokenArgumentDTO = {
  nickname: string;
  identity: IdentityType;
  isAdmin: boolean;
  email: string;
};

export type AccessTokenDTO = BaseTokenDTO & AccessTokenArgumentDTO;
