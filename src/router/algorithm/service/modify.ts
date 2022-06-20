import { getCustomRepository } from "typeorm";
import { ModifyAlgorithmDTO } from "../../../DTO/algorithm.dto";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { HttpException } from "../../../exception";
import { AlgorithmRepository } from "../../../repository";
import { createRes } from "../../../util/http";
import { isNumeric } from "../../../util/number";
import { getBody } from "../../../util/req";

const modifyAlgorithmContent = async (
  event: APIGatewayEventIncludeConnectionName,
) => {
  const id = event.pathParameters?.idx;

  if (!isNumeric(id)) {
    throw new HttpException("JL007");
  }

  const data: ModifyAlgorithmDTO = getBody<ModifyAlgorithmDTO>(event.body);
  const algorithmRepo = getCustomRepository(
    AlgorithmRepository,
    event.connectionName,
  );
  return createRes({
    data: await algorithmRepo.modifyAlgorithm(Number(id), data),
  });
};

export default modifyAlgorithmContent;
