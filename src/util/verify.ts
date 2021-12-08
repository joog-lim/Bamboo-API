import { getRepository } from "typeorm";
import { Question } from "../entity";

export const checkQuestionAnswer: Function = async (
  id: string,
  answer: string
): Promise<boolean> =>
  id ? (await getRepository(Question).findOne(id)).answer == answer : false;
