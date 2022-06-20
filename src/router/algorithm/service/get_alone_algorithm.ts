import { getCustomRepository } from "typeorm";
import {
  APIGatewayEventIncludeConnectionName,
  ReturnResHTTPData,
} from "../../../DTO/http.dto";
import { HttpException } from "../../../exception";
import { AlgorithmRepository } from "../../../repository";
import { createRes } from "../../../util/http";

const getAlgorithmByIdx = (
  type: "user" | "admin",
): ((
  event: APIGatewayEventIncludeConnectionName,
) => Promise<ReturnResHTTPData>) => {
  return async (event: APIGatewayEventIncludeConnectionName) => {
    const idx = event.pathParameters?.idx;
    if (!idx) {
      throw new HttpException("JL003");
    }

    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName,
    );

    const data = await algorithmRepo.getAlgorithmByIdx(idx);

    if (!data) {
      throw new HttpException("JL014");
    }
    if (
      (data.algorithmStatusStatus === "REJECTED" ||
        data.algorithmStatusStatus === "PENDING") &&
      type === "user"
    ) {
      throw new HttpException("JL010");
    }
    return createRes({ data });
  };
};

export default getAlgorithmByIdx;
