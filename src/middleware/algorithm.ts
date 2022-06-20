import { getCustomRepository } from "typeorm";
import { CheckAlgorithmNumber } from "../DTO/algorithm.dto";
import { HttpException } from "../exception";
import { AlgorithmRepository } from "../repository/algorithm";
import { getBody } from "../util/req";
import { Middleware } from "./type";

export function checkAlgorithm(solution: "param" | "body"): Middleware {
  return (method) => async (event) => {
    const connection = event.connectionName;

    const algorithmRepo = getCustomRepository(AlgorithmRepository, connection);
    const idx =
      solution === "param"
        ? Number(event.pathParameters?.idx)
        : getBody<CheckAlgorithmNumber>(event.body).number;

    const algorithm = await algorithmRepo.getBaseAlgorithmByIdx(idx);

    if (algorithm) {
      return method(event);
    } else {
      throw new HttpException("JL012");
    }
  };
}
