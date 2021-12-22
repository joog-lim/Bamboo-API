import { getRepository } from "typeorm";
import { Question } from "../entity";

export const checkQuestionAnswer: Function = async (
  id: string,
  answer: string
): Promise<boolean> =>
  id ? (await getRepository(Question).findOne(id)).answer == answer : false;

export const getIsStudent: Function = async (
  email: string
): Promise<boolean> => {
  const year = parseInt(email.substring(1, 3))
  const nowYear = parseInt(String(new Date().getFullYear()).substring(2, 4))
  const isStudent = nowYear % year == 0 ? true : (nowYear % year == 1 ? true : nowYear % year == 2 ? true : false)
  return isStudent;
}
