import { getCustomRepository } from "typeorm";

import {
  AlgorithmStatusType,
  BaseAlgorithmDTO,
  ModifyAlgorithmDTO,
  SetStatusAlgorithmDTO,
} from "../../DTO/algorithm.dto";
import { bold13, bold15, ruleForWeb, rules } from "../../config";
import { Algorithm } from "../../entity";

import { AlgorithmRepository } from "../../repository";

import { AccessTokenDTO } from "../../DTO/user.dto";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import { HttpException } from "../../exception/http.exception";

import {
  generateAlgorithmListResponse,
  getAlgorithmList,
} from "../../util/algorithm";
import { createRes } from "../../util/http";
import { isNumeric } from "../../util/number";
import {
  algorithemDeleteEvenetMessage,
  sendAlgorithmMessageOfStatus,
} from "../../util/discord";

import { verifyToken } from "../../util/token";
import { getAuthorizationByHeader, getBody } from "../../util/req";
import { reduce } from "@fxts/core";

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

    const type = event.pathParameters?.type ?? "cursor";

    const STATUS: AlgorithmStatusType = "ACCEPTED";

    const user = verifyToken(
      getAuthorizationByHeader(event.headers),
    ) as AccessTokenDTO;

    const result: Algorithm[] = await getAlgorithmList(
      event.connectionName,
      { count: Number(count), criteria: Number(criteria), status: STATUS },
      user?.subId,
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

    const type = event.pathParameters?.type ?? "cursor";

    const { isAdmin, subId } = verifyToken(
      getAuthorizationByHeader(event.headers),
    ) as AccessTokenDTO;

    if (!isAdmin) {
      throw new HttpException("JL002");
    }

    const result: Algorithm[] = await getAlgorithmList(
      event.connectionName,
      { count, criteria, status },
      subId,
      type,
    );

    const data = generateAlgorithmListResponse({
      algorithmList: result,
      status,
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
    const id = event.pathParameters?.id;

    if (!isNumeric(id)) {
      throw new HttpException("JL007");
    }

    const data: ModifyAlgorithmDTO = getBody<ModifyAlgorithmDTO>(event.body);
    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName,
    );
    return createRes({
      data: await algorithmRepo.modifyAlgorithm(Number(id), data),
    });
  },

  deleteAlgorithm: async (event: APIGatewayEventIncludeDBName) => {
    const id = event.pathParameters?.id;

    if (!isNumeric(id)) {
      throw new HttpException("JL007");
    }

    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName,
    );

    const targetAlgorithm = await algorithmRepo.getBaseAlgorithmByIdx(
      Number(id),
    );

    if (
      targetAlgorithm?.algorithmStatusStatus !== "ACCEPTED" &&
      targetAlgorithm?.algorithmStatusStatus !== "REPORTED"
    ) {
      throw new HttpException("JL007");
    }
    await algorithmRepo.deleteAlgorithm(Number(id));

    await algorithemDeleteEvenetMessage(targetAlgorithm);
    return createRes({});
  },

  setAlgorithmStatus: async (event: APIGatewayEventIncludeDBName) => {
    const id = event.pathParameters?.id;

    if (!isNumeric(id)) {
      throw new HttpException("JL007");
    }

    const numericId = Number(id);

    const userData = verifyToken(
      getAuthorizationByHeader(event.headers),
    ) as AccessTokenDTO;

    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      event.connectionName,
    );

    const reqBody = getBody<SetStatusAlgorithmDTO>(event.body);

    const changeStatus = reqBody.status;
    if (!changeStatus || changeStatus === "PENDING") {
      throw new HttpException("JL010");
    }

    if (!userData?.isAdmin && changeStatus !== "REPORTED") {
      throw new HttpException("JL010");
    }

    const reason = reqBody?.reason || "";

    userData?.isAdmin
      ? await algorithmRepo.rejectOrAcceptAlgorithm(
          numericId,
          reason,
          changeStatus,
        )
      : await algorithmRepo.reportAlgorithm(numericId, reason);

    const algorithm = await algorithmRepo.getBaseAlgorithmByIdx(numericId);

    await sendAlgorithmMessageOfStatus[changeStatus](algorithm);
    return createRes({ data: algorithm });
  },
};

const checkArgument: Function = (...args: any[]): boolean => {
  return reduce((a, b) => !!a && !!b, args);
};
