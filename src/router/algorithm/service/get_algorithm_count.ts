import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AlgorithmRepository } from "../../../repository";
import { createRes } from "../../../util/http";

const getAlgorithmCountAtAll = async ({
  connectionName,
}: APIGatewayEventIncludeConnectionName) =>
  createRes({
    data: await getCustomRepository(
      AlgorithmRepository,
      connectionName,
    ).getAlgorithmCountAtAll(),
  });
export default getAlgorithmCountAtAll;
