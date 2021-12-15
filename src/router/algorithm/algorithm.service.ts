import { getRepository } from "typeorm";
import { BaseAlgorithmDTO } from "../../DTO/algorithm.dto";
import { Algorithm } from "../../entity";
import { getLastPostNumber } from "../../util/algorithm";
import { createErrorRes, createRes, ERROR_CODE } from "../../util/http";

export const AlgorithmService: { [k: string]: Function } = {
  writeAlgorithm: async ({ title, content, tag }: BaseAlgorithmDTO) => {
    if (!checkArgument(title, content, tag)) {
      return createErrorRes({ errorCode: ERROR_CODE.JL003 });
    }
    try {
      await getRepository(Algorithm).insert({
        postNumber: (await getLastPostNumber("PENDING")) + 1,
        title,
        content,
        tag,
        algorithmStatus: { status: "PENDING" },
      });
      return createRes({ statusCode: 201 });
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: ERROR_CODE.JL004 });
    }
  },
};

const checkArgument: Function = (...args: any[]): boolean => {
  for (let i = 0; i < args.length; i++) {
    if (args[i] || false) {
      continue;
    }
    return false;
  }
  return true;
};