import { getCustomRepository } from "typeorm";
import { AlgorithmRepository } from "../../../repository";
import { createRes } from "../../../util/http";

const getAlgorithmCountAtAll = async (connectionName: string) =>
  createRes({
    data: await getCustomRepository(
      AlgorithmRepository,
      connectionName,
    ).getAlgorithmCountAtAll(),
  });
export default getAlgorithmCountAtAll;
