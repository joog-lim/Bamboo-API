import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeDBName } from "../DTO/http.dto";
import { AlgorithmRepository } from "../repository/algorithm";
import { createErrorRes } from "../util/http";

export function checkAlgorithm(solution: "param" | "body") {
  return function (_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value; // get function with a decorator on it.
    desc.value = async function (...args: any[]) {
      // argument override
      const req: APIGatewayEventIncludeDBName = args[0];
      const connection = req.connectionName;

      const algorithmRepo = getCustomRepository(
        AlgorithmRepository,
        connection,
      );
      const idx =
        solution === "param"
          ? req.pathParameters.id
          : JSON.parse(req.body)?.number;

      const algorithm = await algorithmRepo.getBaseAlgorithmByIdx(idx);

      if (algorithm) {
        return originMethod.apply(this, args);
      } else {
        return createErrorRes({ errorCode: "JL012", status: 404 });
      }
    };
  };
}
