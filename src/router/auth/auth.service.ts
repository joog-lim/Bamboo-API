import { getRepository } from "typeorm";
import { QuestionDTO } from "../../DTO/question.dto";
import { Question } from "../../entity";
import { createErrorRes, createRes, ERROR_CODE } from "../../util/http";

export const AuthService: { [k: string]: Function } = {
  addVerifyQuestion: async ({ question, answer }: QuestionDTO) => {
    if (!question || !answer) {
      return createErrorRes({ status: 400, errorCode: ERROR_CODE.JL003 });
    }
    try {
      await getRepository(Question).insert({ question, answer });
      return createRes({ statusCode: 201 });
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: ERROR_CODE.JL004 });
    }
  },
  getVerifyQuestion: async () => {
    const repo = getRepository(Question);

    const count = await repo.count();
    const random: number = Math.floor(Math.random() * count);
    try {
      return createRes({
        body: (
          await repo.find({ select: ["id", "question"], skip: random, take: 1 })
        )[0],
      });
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: ERROR_CODE.JL004 });
    }
  },
};
