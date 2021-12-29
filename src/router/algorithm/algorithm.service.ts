import { APIGatewayEvent } from "aws-lambda";
import { JwtPayload } from "jsonwebtoken";
import { getCustomRepository, getRepository } from "typeorm";

import {
  AlgorithmStatusType,
  BaseAlgorithmDTO,
  ModifyAlgorithmDTO,
} from "../../DTO/algorithm.dto";
import { bold13, bold15, ruleForWeb, rules } from "../../config";
import { Algorithm } from "../../entity";

import { AlgorithmRepository } from "../../repository/algorithm";
import { UserRepository } from "../../repository/user";

import { getLastPostNumber } from "../../util/algorithm";
import { createErrorRes, createRes } from "../../util/http";
import { isNumeric } from "../../util/number";
import { verifyToken } from "../../util/token";
import { sendAlgorithmMessageOfStatus } from "../../util/discord";
import { AccessTokenDTO } from "../../DTO/user.dto";

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
      await sendAlgorithmMessageOfStatus["PENDING"]({ title, content, tag });
      return createRes({ statusCode: 201 });
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: "JL004" });
    }
  },

  getAlgorithmList: async (event: APIGatewayEvent) => {
    const { count, cursor, status } = event.queryStringParameters;
    if (!isNumeric(count)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const userTokens = verifyToken(
      event.headers.Authorization ?? event.headers.authorization
    ) as JwtPayload;

    let isAdmin = false;
    if (userTokens !== null) {
      const userRepo = getCustomRepository(UserRepository);
      isAdmin = await userRepo.getIsAdminByEmail(userTokens.email);
    }

    const algorithmRepo = getCustomRepository(AlgorithmRepository);
    const algorithmList = await algorithmRepo.getListByCursor({
      count: Number(count) === 0 ? null : Number(count),
      cursor: parseInt(cursor),
      status: status as AlgorithmStatusType,
      isAdmin,
    });

    return createRes({ body: algorithmList });
  },
  getAlgorithmListAtPage: async (event: APIGatewayEvent) => {
    const { count, page, status } = event.queryStringParameters;

    if (!isNumeric(count) || !isNumeric(page)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const userTokens = verifyToken(
      event.headers.Authorization ?? event.headers.authorization
    ) as JwtPayload;

    let isAdmin = false;
    if (userTokens !== null) {
      const userRepo = getCustomRepository(UserRepository);
      isAdmin = await userRepo.getIsAdminByEmail(userTokens.email);
    }
    const algorithmRepo = getCustomRepository(AlgorithmRepository);

    const algorithmList = await algorithmRepo.getListByPage({
      count: Number(count) === 0 ? null : Number(count),
      page: parseInt(page),
      status: status as AlgorithmStatusType,
      isAdmin,
    });

    return createRes({ body: algorithmList });
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

  setAlgorithmStatus: async (event: APIGatewayEvent) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const userData = verifyToken(
      event.headers.Authorization ?? event.headers.authorization
    ) as AccessTokenDTO;

    const algorithmRepo = getCustomRepository(AlgorithmRepository);
    const changeStatus = JSON.parse(event.body)?.status as AlgorithmStatusType;
    if (changeStatus === "PENDING" || "REPORTED") {
      return createErrorRes({ errorCode: "JL010" });
    }
    const data = userData?.isAdmin
      ? await algorithmRepo.rejectOrAcceptAlgorithm(Number(id), changeStatus)
      : await algorithmRepo.reportAlgorithm(Number(id));

    return createRes({ body: data });
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
