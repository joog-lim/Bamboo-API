import jwt, { JwtPayload } from "jsonwebtoken";

import { issuer } from "../config";
import { AccessTokenArgumentDTO } from "../DTO/user.dto";

export const verifyToken = (token: string): null | string | JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
};

export const generateAccessToken = (data: AccessTokenArgumentDTO) =>
  jwt.sign(
    Object.assign({}, data, { tokenType: "AccessToken" }),
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
      issuer,
    }
  );

export const generateRefreshToken = () =>
  jwt.sign({ tokenType: "AccessToken" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
    issuer,
  });
