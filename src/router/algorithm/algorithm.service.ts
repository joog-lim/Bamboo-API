import { getCustomRepository } from "typeorm";

import {
  AlgorithmStatusType,
  BaseAlgorithmDTO,
  ModifyAlgorithmDTO,
} from "../../DTO/algorithm.dto";
import { bold13, bold15, ruleForWeb, rules } from "../../config";
import { Algorithm } from "../../entity";

import { AlgorithmRepository } from "../../repository/algorithm";

import {
  generateAlgorithmListResponse,
  getAlgorithmList,
} from "../../util/algorithm";
import { createErrorRes, createRes } from "../../util/http";
import { isNumeric } from "../../util/number";
import {
  algorithemDeleteEvenetMessage,
  sendAlgorithmMessageOfStatus,
} from "../../util/discord";
import { AccessTokenDTO } from "../../DTO/user.dto";
import { getIsAdminAndEmailByAccessToken } from "../../util/user";
import { verifyToken } from "../../util/token";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import { UserRepository } from "../../repository/user";
import { HttpException } from "../../exception/http.exception";

export const AlgorithmService: { [k: string]: Function } = {
  writeAlgorithm: async (
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
  },

  getAlgorithmListByUser: async (event: APIGatewayEventIncludeDBName) => {
    const { count, criteria } = {
      count: "10",
      criteria: "0", // setting default value
      ...event.queryStringParameters,
    };

    if (!isNumeric(count) || !isNumeric(criteria)) {
      throw new HttpException("JL007");
    }
    const type = event.pathParameters.type ?? "cursor";

    const { _, email } = await getIsAdminAndEmailByAccessToken(
      event.headers.Authorization ?? event.headers.authorization,
    );

    const STATUS: AlgorithmStatusType = "ACCEPTED";
    const sub = await getCustomRepository(
      UserRepository,
      event.connectionName,
    ).getSubByEmail(email);

    const result: Algorithm[] = await getAlgorithmList(
      event.connectionName,
      { count: Number(count), criteria: Number(criteria), status: STATUS },
      sub,
      type,
    );

    const data = generateAlgorithmListResponse({
      algorithmList: result,
      status: STATUS,
      count,
      type,
    });

    return createRes({
      data,
    });
  },
  getAlgorithmListByAdmin: async (event: APIGatewayEventIncludeDBName) => {
    const { count, criteria, status } = {
      count: "10",
      criteria: "0",
      status: "ACCEPTED", // setting default value
      ...event.queryStringParameters,
    };

    if (!isNumeric(count) || !isNumeric(criteria)) {
      throw new HttpException("JL007");
    }

    const type = event.pathParameters.type ?? "cursor";

    const { isAdmin, email } = await getIsAdminAndEmailByAccessToken(
      event.headers.Authorization ?? event.headers.authorization,
    );

    const STATUS = isAdmin ? (status as AlgorithmStatusType) : "ACCEPTED";

    const sub = await getCustomRepository(
      UserRepository,
      event.connectionName,
    ).getSubByEmail(email);

    const result: Algorithm[] = await getAlgorithmList(
      event.connectionName,
      { count, criteria, status: STATUS },
      sub,
      type,
    );
    const data = generateAlgorithmListResponse({
      algorithmList: result,
      status: STATUS,
      count,
      type,
    });

    return createRes({
      data,
    });
  },

  getAlgorithmCountAtAll: async (connectionName: string) => {
    const result = await getCustomRepository(
      AlgorithmRepository,
      connectionName,
    ).getAlgorithmCountAtAll();
    return createRes({ data: result });
  },

  getAlgorithmRules: () =>
    createRes({
      data: {
        content: rules,
        bold13,
        bold15,
      },
    }),

  getAlgorithmRulesForWeb: () =>
    createRes({
      data: {
        content: ruleForWeb,
      },
    }),

  modifyAlgorithmContent: async (event: APIGatewayEventIncludeDBName) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      throw new HttpException("JL007");
    }

    const data: ModifyAlgorithmDTO = JSON.parse(event.body);
    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName,
    );
    return createRes({
      data: await algorithmRepo.modifyAlgorithm(Number(id), data),
    });
  },

  deleteAlgorithm: async (event: APIGatewayEventIncludeDBName) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      throw new HttpException("JL007");
    }

    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName,
    );

    const targetAlgorithm: Algorithm =
      await algorithmRepo.getBaseAlgorithmByIdx(Number(id));

    if (
      targetAlgorithm.algorithmStatusStatus !== "ACCEPTED" &&
      targetAlgorithm.algorithmStatusStatus !== "REPORTED"
    ) {
      throw new HttpException("JL007");
    }
    await algorithmRepo.deleteAlgorithm(Number(id));

    await algorithemDeleteEvenetMessage(targetAlgorithm);
    return createRes({});
  },

  setAlgorithmStatus: async (event: APIGatewayEventIncludeDBName) => {
    const { id } = event.pathParameters;

    if (!isNumeric(id)) {
      throw new HttpException("JL007");
    }

    const numericId = Number(id);

    const userData = verifyToken(
      event.headers.Authorization ?? event.headers.authorization,
    ) as AccessTokenDTO;

    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName,
    );

    const reqBody = JSON.parse(event.body);

    const changeStatus = reqBody?.status as AlgorithmStatusType;
    if (!changeStatus || changeStatus === "PENDING") {
      throw new HttpException("JL010");
    }

    const { reason } = reqBody;
    userData?.isAdmin
      ? await algorithmRepo.rejectOrAcceptAlgorithm(
          numericId,
          reason,
          changeStatus,
        )
      : await algorithmRepo.reportAlgorithm(numericId, reason);

    const { title, content, tag } = await algorithmRepo.getBaseAlgorithmByIdx(
      numericId,
    );

    await sendAlgorithmMessageOfStatus[changeStatus]({ title, content, tag });
    return createRes({ data: { title, content, tag } });
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
