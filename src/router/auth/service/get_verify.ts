import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { HttpException } from "../../../exception";
import { QuestionRepository } from "../../../repository";
import { createRes } from "../../../util/http";

const getVerifyQuestion = async ({
  connectionName,
}: APIGatewayEventIncludeConnectionName) => {
  try {
    return createRes({
      data: await getCustomRepository(
        QuestionRepository,
        connectionName,
      ).getVerifyQuestion(),
    });
  } catch (e: unknown) {
    console.error(e);
    throw new HttpException("JL004");
  }
};

export default getVerifyQuestion;
