import { getCustomRepository } from "typeorm";
import { QuestionDTO } from "../../../DTO/question.dto";
import { HttpException } from "../../../exception";
import { QuestionRepository } from "../../../repository";
import { createRes } from "../../../util/http";

const addVerifyQuestion = async (
  { question, answer }: QuestionDTO,
  connectionName: string,
) => {
  if (!question || !answer) {
    throw new HttpException("JL003");
  }
  try {
    await getCustomRepository(QuestionRepository, connectionName).insert({
      question,
      answer,
    });
    return createRes({});
  } catch (e: unknown) {
    console.error(e);
    throw new HttpException("JL004");
  }
};

export default addVerifyQuestion;
