import { getRepository } from "typeorm";
import { IdentityType } from "../DTO/user.dto";
import { Question } from "../entity";

export const checkQuestionAnswer: Function = async (
  id: string,
  answer: string
): Promise<boolean> =>
  id ? (await getRepository(Question).findOne(id)).answer == answer : false;

export const getIdentity: Function = (email: string): IdentityType => {
  if (!/s\d{5}@gsm.hs.kr/.test(email)) return "faculty";

  const year = parseInt(email.substring(1, 3));
  const nowYear = parseInt(String(new Date().getFullYear()).substring(2, 4));

  return nowYear % year <= 2 ? "student" : "graduate";
};
