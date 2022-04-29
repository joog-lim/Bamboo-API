import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { HttpException } from "../../../exception";
import { AlgorithmRepository } from "../../../repository";
import { algorithemDeleteEvenetMessage } from "../../../util/discord";
import { createRes } from "../../../util/http";
import { isNumeric } from "../../../util/number";

const deleteAlgorithm = async (event: APIGatewayEventIncludeConnectionName) => {
  const id = event.pathParameters?.idx;

  if (!isNumeric(id)) {
    throw new HttpException("JL007");
  }

  const algorithmRepo = getCustomRepository(
    AlgorithmRepository,
    event.connectionName,
  );

  const targetAlgorithm = await algorithmRepo.getBaseAlgorithmByIdx(Number(id));

  if (
    targetAlgorithm?.algorithmStatusStatus !== "ACCEPTED" &&
    targetAlgorithm?.algorithmStatusStatus !== "REPORTED"
  ) {
    throw new HttpException("JL007");
  }
  await algorithmRepo.deleteAlgorithm(Number(id));

  await algorithemDeleteEvenetMessage(targetAlgorithm);
  return createRes({});
};

export default deleteAlgorithm;
