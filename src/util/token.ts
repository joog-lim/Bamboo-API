import jwt, { JwtPayload } from "jsonwebtoken";

export const verifyToken = (token: string): null | string | JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
};
