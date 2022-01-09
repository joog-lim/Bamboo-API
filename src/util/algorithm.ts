import { getRepository } from "typeorm";
import { AlgorithmStatusType } from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";

export const getLastPostNumber: Function = async (
  status: AlgorithmStatusType,
  connectionName: string
) => {
  return (
    (
      await getRepository(Algorithm, connectionName).find({
        where: { algorithmStatus: { status } },
        order: { algorithmNumber: "DESC" },
        take: 1,
      })
    )[0]?.algorithmNumber ?? 1
  );
};
