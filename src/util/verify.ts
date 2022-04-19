import { OAuth2Client, TokenPayload } from "google-auth-library";
import { CLIENT_ID_ANDROID, CLIENT_ID_IOS, CLIENT_ID_WEB } from "../config";

export const testIsGSMStudentEmail: Function = (email: string): boolean =>
  /^(student\d{6}|s\d{5})@gsm.hs.kr$/.test(email);

export const testIsGSMEmail: Function = (email: string): boolean =>
  /@gsm.hs.kr$/.test(email);

export const getGeneration: Function = (email: string): number =>
  Number(email.replace(/[^0-9]/g, "").slice(0, 2)) - 16;

export const authGoogleToken: Function = async (
  token: string,
): Promise<TokenPayload | undefined> => {
  const client = new OAuth2Client(CLIENT_ID_WEB);
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [CLIENT_ID_WEB, CLIENT_ID_ANDROID, CLIENT_ID_IOS],
    });
    return ticket.getPayload();
  } catch (e: unknown) {
    return undefined;
  }
};

export const hash: Function = (pw: string) =>
  CryptoJS.HmacSHA256(pw, process.env.SALT || "joog-lim.info");
