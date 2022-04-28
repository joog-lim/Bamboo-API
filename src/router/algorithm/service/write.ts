import { getCustomRepository } from "typeorm";
import { BaseAlgorithmDTO } from "../../../DTO/algorithm.dto";
import { HttpException } from "../../../exception";
import { AlgorithmRepository } from "../../../repository";
import { sendAlgorithmMessageOfStatus } from "../../../util/discord";
import { checkArgument, createRes } from "../../../util/http";

const writeAlgorithm = async (
  { title, content, tag }: BaseAlgorithmDTO,
  connectionName: string,
) => {
  if (!checkArgument(title, content, tag)) {
    throw new HttpException("JL003");
  }
  try {
    const algorithmRepo: AlgorithmRepository = getCustomRepository(
      AlgorithmRepository,
      connectionName,
    );
    await algorithmRepo.insert({
      algorithmNumber:
        ((await algorithmRepo.getLastAlgorithmNumber("PENDING")) ?? 1) + 1,
      title,
      content,
      tag,
      algorithmStatus: { status: "PENDING" },
    });
    await sendAlgorithmMessageOfStatus["PENDING"]({ title, content, tag });
    return createRes({});
  } catch (e: unknown) {
    console.error(e);
    throw new HttpException("JL004");
  }
};

export default writeAlgorithm;
