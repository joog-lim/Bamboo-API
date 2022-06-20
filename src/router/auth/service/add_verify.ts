import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { QuestionDTO } from "../../../DTO/question.dto";
import { HttpException } from "../../../exception";
import { QuestionRepository } from "../../../repository";
import { createRes } from "../../../util/http";
import { getBody } from "../../../util/req";

const addVerifyQuestion = async (
  event: APIGatewayEventIncludeConnectionName,
) => {
  const { question, answer } = getBody<QuestionDTO>(event.body);

  if (!question || !answer) {
    throw new HttpException("JL003");
  }
  try {
    await getCustomRepository(QuestionRepository, event.connectionName).insert({
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
