import { APIGatewayEvent } from "aws-lambda";
import { getCustomRepository } from "typeorm";
import { BaseAlgorithmDTO } from "../../../DTO/algorithm.dto";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { HttpException } from "../../../exception";
import { AlgorithmRepository } from "../../../repository";
import { sendAlgorithmMessageOfStatus } from "../../../util/discord";
import { checkArgument, createRes } from "../../../util/http";
import { getBody } from "../../../util/req";

const writeAlgorithm = async (event: APIGatewayEventIncludeConnectionName) => {
  const { title, content, tag } = getBody<BaseAlgorithmDTO>(event.body);
  if (!checkArgument(title, content, tag)) {
    throw new HttpException("JL003");
  }

  try {
    const algorithmRepo: AlgorithmRepository = getCustomRepository(
      AlgorithmRepository,
      event.connectionName,
    );
    await algorithmRepo.insert({
      algorithmNumber:
        ((await algorithmRepo.getLastAlgorithmNumber("PENDING")) ?? 1) + 1,
      title,
      content,
      tag,
      algorithmStatus: { status: "PENDING" },
    });
    await sendAlgorithmMessageOfStatus["PENDING"]({ title, content, tag });
    return createRes({});
  } catch (e: unknown) {
    console.error(e);
    throw new HttpException("JL004");
  }
};

export default writeAlgorithm;
