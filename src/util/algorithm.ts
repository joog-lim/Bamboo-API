import { getRepository } from "typeorm";
import { AlgorithmStatusType, JoinAlgorithmDTO } from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";

export const getLastPostNumber: Function = async (
  status: AlgorithmStatusType
) => {
  return (
    (
      await getRepository(Algorithm).find({
        where: { algorithmStatus: { status } },
        order: { postNumber: "DESC" },
        take: 1,
      })
    )[0]?.postNumber ?? 1
  );
};
