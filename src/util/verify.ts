import { OAuth2Client, TokenPayload } from "google-auth-library";
import { getRepository } from "typeorm";
import { CLIENT_ID_ANDROID, CLIENT_ID_IOS, CLIENT_ID_WEB } from "../config";
import { IdentityType } from "../DTO/user.dto";
import { Question } from "../entity";

export const checkQuestionAnswer: Function = async (
  id: string,
  answer: string,
  dbName: string
): Promise<boolean> =>
  id
    ? (await getRepository(Question, dbName).findOne(id)).answer == answer
    : false;

export const getIdentity: Function = (email: string): IdentityType => {
  if (!/s\d{5}@gsm.hs.kr/.test(email)) return "faculty";

  const year = parseInt(email.substring(1, 3));
  const nowYear = parseInt(String(new Date().getFullYear()).substring(2, 4));

  return nowYear % year <= 2 ? "student" : "graduate";
};

export const authGoogleToken: Function = async (
  token: string
): Promise<TokenPayload> => {
  const client = new OAuth2Client(CLIENT_ID_WEB);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [CLIENT_ID_WEB, CLIENT_ID_ANDROID, CLIENT_ID_IOS],
  });
  const payload = ticket.getPayload();
  return payload;
};
