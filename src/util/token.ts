import jwt, { JwtPayload } from "jsonwebtoken";

export const decodeToken = (token : string) : null | string | JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}