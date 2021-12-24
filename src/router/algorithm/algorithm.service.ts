import { APIGatewayEvent } from "aws-lambda";
import { getCustomRepository, getRepository } from "typeorm";

import { bold13, bold15, ruleForWeb, rules } from "../../config";
import { BaseAlgorithmDTO, ModifyAlgorithmDTO } from "../../DTO/algorithm.dto";
import { Algorithm } from "../../entity";
import { AlgorithmRepository } from "../../repository/algorithm";
import { getLastPostNumber } from "../../util/algorithm";
import { createErrorRes, createRes } from "../../util/http";
import { isNumeric } from "../../util/number";

export const AlgorithmService: { [k: string]: Function } = {
  writeAlgorithm: async ({ title, content, tag }: BaseAlgorithmDTO) => {
    if (!checkArgument(title, content, tag)) {
      return createErrorRes({ errorCode: "JL003" });
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
      return createErrorRes({ status: 500, errorCode: "JL004" });
    }
  },
  getAlgorithmCountAtAll: async () => {
    const result = await getCustomRepository(
      AlgorithmRepository
    ).getAlgorithmCountAtAll();
    return createRes({ body: result });
  },
  getAlgorithmRules: () => {
    return createRes({
      body: {
        content: rules,
        bold13,
        bold15,
      },
    });
  },
  getAlgorithmRulesForWeb: () => {
    return createRes({
      body: {
        content: ruleForWeb,
      },
    });
  },
  modifyAlgorithmContent: async (event: APIGatewayEvent) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const data: ModifyAlgorithmDTO = JSON.parse(event.body);
    const algorithmRepo = getCustomRepository(AlgorithmRepository);
    return createRes({
      body: await algorithmRepo.modifyAlgorithm(Number(id), data),
    });
  },
  deleteAlgorithm: async (event: APIGatewayEvent) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const algorithmRepo = getCustomRepository(AlgorithmRepository);
    await algorithmRepo.deleteAlgorithm(Number(id));
    return createRes({});
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
