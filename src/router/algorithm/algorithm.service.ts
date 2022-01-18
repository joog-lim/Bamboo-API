import { getCustomRepository, getRepository } from "typeorm";

import {
  AlgorithmStatusType,
  BaseAlgorithmDTO,
  ModifyAlgorithmDTO,
} from "../../DTO/algorithm.dto";
import { bold13, bold15, ruleForWeb, rules } from "../../config";
import { Algorithm } from "../../entity";

import { AlgorithmRepository } from "../../repository/algorithm";

import { getAlgorithmList, getLastPostNumber } from "../../util/algorithm";
import { createErrorRes, createRes } from "../../util/http";
import { isNumeric } from "../../util/number";
import {
  algorithemDeleteEvenetMessage,
  sendAlgorithmMessageOfStatus,
} from "../../util/discord";
import { AccessTokenDTO } from "../../DTO/user.dto";
import { getIsAdminAndSubByAccessToken } from "../../util/user";
import { verifyToken } from "../../util/token";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";

export const AlgorithmService: { [k: string]: Function } = {
  writeAlgorithm: async (
    { title, content, tag }: BaseAlgorithmDTO,
    connectionName: string
  ) => {
    if (!checkArgument(title, content, tag)) {
      return createErrorRes({ errorCode: "JL003" });
    }
    try {
      await getRepository(Algorithm, connectionName).insert({
        algorithmNumber:
          (await getLastPostNumber("PENDING", connectionName)) + 1,
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

  getAlgorithmListByUser: async (event: APIGatewayEventIncludeDBName) => {
    const { count, criteria } = Object.assign(
      {},
      { count: "10", criteria: "0" },
      event.queryStringParameters
    );
    if (!isNumeric(count) || !isNumeric(criteria)) {
      return createErrorRes({ errorCode: "JL007" });
    }
    const type = event.pathParameters.type ?? "cursor";

    const { _, sub } = await getIsAdminAndSubByAccessToken(
      event.headers.Authorization ?? event.headers.authorization,
      event.connectionName
    );
    const STATUS: AlgorithmStatusType = "ACCEPTED";

    const result: Algorithm[] = await getAlgorithmList(
      event.connectionName,
      { count, criteria, status: STATUS },
      sub,
      type
    );

    return createRes({
      body: { result, status: STATUS },
    });
  },
  getAlgorithmListByAdmin: async (event: APIGatewayEventIncludeDBName) => {
    const { count, criteria, status } = Object.assign(
      {},
      { count: "10", criteria: "0", status: "ACCEPTED" }, // setting default value
      event.queryStringParameters
    );
    if (!isNumeric(count) || !isNumeric(criteria)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const type = event.pathParameters.type ?? "cursor";

    const { isAdmin, sub } = await getIsAdminAndSubByAccessToken(
      event.headers.Authorization ?? event.headers.authorization,
      event.connectionName
    );
    const STATUS = isAdmin ? (status as AlgorithmStatusType) : "ACCEPTED";
    const result: Algorithm[] = await getAlgorithmList(
      event.connectionName,
      { count, criteria, status: STATUS },
      sub,
      type
    );
    return createRes({
      body: { result, status: STATUS },
    });
  },

  getAlgorithmCountAtAll: async (connectionName: string) => {
    const result = await getCustomRepository(
      AlgorithmRepository,
      connectionName
    ).getAlgorithmCountAtAll();
    return createRes({ body: result });
  },

  getAlgorithmRules: () =>
    createRes({
      body: {
        content: rules,
        bold13,
        bold15,
      },
    }),

  getAlgorithmRulesForWeb: () =>
    createRes({
      body: {
        content: ruleForWeb,
      },
    }),

  modifyAlgorithmContent: async (event: APIGatewayEventIncludeDBName) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const data: ModifyAlgorithmDTO = JSON.parse(event.body);
    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName
    );
    return createRes({
      body: await algorithmRepo.modifyAlgorithm(Number(id), data),
    });
  },

  deleteAlgorithm: async (event: APIGatewayEventIncludeDBName) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName
    );

    await algorithmRepo.deleteAlgorithm(Number(id));

    const { title, content, tag } = await algorithmRepo.getBaseAlgorithmByIdx(
      Number(id)
    );

    await algorithemDeleteEvenetMessage({ title, content, tag });
    return createRes({});
  },

  setAlgorithmStatus: async (event: APIGatewayEventIncludeDBName) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const userData = verifyToken(
      event.headers.Authorization ?? event.headers.authorization
    ) as AccessTokenDTO;

    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName
    );

    const reqBody = JSON.parse(event.body);

    const changeStatus = reqBody?.status as AlgorithmStatusType;
    if (!changeStatus || changeStatus === "PENDING") {
      return createErrorRes({ errorCode: "JL010" });
    }

    const { reason } = reqBody;
    userData?.isAdmin
      ? await algorithmRepo.rejectOrAcceptAlgorithm(
          Number(id),
          reason,
          changeStatus
        )
      : await algorithmRepo.reportAlgorithm(Number(id), reason);

    const { title, content, tag } = await algorithmRepo.getBaseAlgorithmByIdx(
      Number(id)
    );

    await sendAlgorithmMessageOfStatus[changeStatus]({ title, content, tag });
    return createRes({ body: { title, content, tag } });
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
