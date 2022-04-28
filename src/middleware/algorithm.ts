import { getCustomRepository } from "typeorm";
import { CheckAlgorithmNumber } from "../DTO/algorithm.dto";
import { APIGatewayEventIncludeConnectionName } from "../DTO/http.dto";
import { HttpException } from "../exception";
import { AlgorithmRepository } from "../repository/algorithm";
import { getBody } from "../util/req";

export function checkAlgorithm(solution: "param" | "body") {
  return function (_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value; // get function with a decorator on it.
    desc.value = async function (...args: any[]) {
      // argument override
      const req: APIGatewayEventIncludeConnectionName = args[0];
      const connection = req.connectionName;

      const algorithmRepo = getCustomRepository(
        AlgorithmRepository,
        connection,
      );
      const idx =
        solution === "param"
          ? Number(req.pathParameters?.idx)
          : getBody<CheckAlgorithmNumber>(req.body).number;

      const algorithm = await algorithmRepo.getBaseAlgorithmByIdx(idx);

      if (algorithm) {
        return originMethod.apply(this, args);
      } else {
        throw new HttpException("JL012");
      }
    };
  };
}
