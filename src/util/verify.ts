import CryptoJS from "crypto-js";
export const testIsGSMStudentEmail: Function = (email: string): boolean =>
  /^(student\d{6}|s\d{5})@gsm.hs.kr$/.test(email);

export const testIsGSMEmail: Function = (email: string): boolean =>
  /@gsm.hs.kr$/.test(email);

export const getGeneration: Function = (email: string): number =>
  Number(email.replace(/[^0-9]/g, "").slice(0, 2)) - 16;

export const hash: Function = (pw: string) =>
  CryptoJS.HmacSHA256(pw, process.env.SALT || "joog-lim.info").toString();
