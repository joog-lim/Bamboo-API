import { getCustomRepository } from "typeorm";

import {
  AlgorithmStatusType,
  BaseAlgorithmDTO,
  ModifyAlgorithmDTO,
  SetStatusAlgorithmDTO,
} from "../../DTO/algorithm.dto";
import { bold13, bold15, ruleForWeb, rules } from "../../config";
import { Algorithm } from "../../entity";

import {
  AlgorithmRepository,
  ReportAlgorithmRepository,
} from "../../repository";

import {
  APIGatewayEventIncludeConnectionName,
  ReturnResHTTPData,
} from "../../DTO/http.dto";
import { HttpException } from "../../exception/http.exception";

import {
  generateAlgorithmListResponse,
  getAlgorithmList,
} from "../../util/algorithm";
import { checkArgument, createRes } from "../../util/http";
import { isNumeric } from "../../util/number";
import {
  algorithemDeleteEvenetMessage,
  sendAlgorithmMessageOfStatus,
} from "../../util/discord";

import { verifyToken } from "../../util/token";
import { getAuthorizationByHeader, getBody } from "../../util/req";
import { AccessTokenDTO, TokenTypeList } from "../../DTO/token.dto";

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

  getAlgorithmByIdx: (
    type: "user" | "admin",
  ): ((
    event: APIGatewayEventIncludeConnectionName,
  ) => Promise<ReturnResHTTPData>) => {
    return async (event: APIGatewayEventIncludeConnectionName) => {
      const idx = event.pathParameters?.idx;
      if (!idx) {
        throw new HttpException("JL003");
      }

      const algorithmRepo = getCustomRepository(
        AlgorithmRepository,
        event.connectionName,
      );

      const data = await algorithmRepo.getAlgorithmByIdx(idx);

      if (!data) {
        throw new HttpException("JL014");
      }
      if (
        (data.algorithmStatusStatus === "REJECTED" ||
          data.algorithmStatusStatus === "PENDING") &&
        type === "user"
      ) {
        throw new HttpException("JL010");
      }
      return createRes({ data });
    };
  },
  getAlgorithmListByUser: async (
    event: APIGatewayEventIncludeConnectionName,
  ) => {
    const param = {
      count: "10",
      criteria: "0", // setting default value
      ...event.queryStringParameters,
    };

    if (!isNumeric(param.count) || !isNumeric(param.criteria)) {
      throw new HttpException("JL007");
    }
    const { count, criteria } = {
      count: Number(param.count),
      criteria: Number(param.criteria),
    };

    const type = event.pathParameters?.type ?? "cursor";

    const STATUS: AlgorithmStatusType = "ACCEPTED";

    const user = verifyToken(getAuthorizationByHeader(event.headers));

    const result: Algorithm[] = await getAlgorithmList(
      event.connectionName,
      { count, criteria, status: STATUS },
      user?.subId,
      type,
    );

    const data = generateAlgorithmListResponse({
      algorithmList: result,
      condition: { status: STATUS, count },
      type,
    });

    return createRes({
      data,
    });
  },

  getAlgorithmListByAdmin: async (
    event: APIGatewayEventIncludeConnectionName,
  ) => {
    const param = {
      count: "10",
      criteria: "0",
      status: "ACCEPTED", // setting default value
      ...event.queryStringParameters,
    };

    if (!isNumeric(param.count) || !isNumeric(param.criteria)) {
      throw new HttpException("JL007");
    }
    const { count, criteria, status } = {
      count: Number(param.count),
      criteria: Number(param.criteria),
      status: param.status,
    };

    const type = event.pathParameters?.type ?? "cursor";

    const token = verifyToken(getAuthorizationByHeader(event.headers));
    if (token?.tokenType !== TokenTypeList.accessToken) {
      throw new HttpException("JL006");
    }
    const { isAdmin, subId } = token;

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
      condition: { status, count },
      type,
    });

    return createRes({
      data,
    });
  },

  modifyAlgorithmContent: async (
    event: APIGatewayEventIncludeConnectionName,
  ) => {
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

  deleteAlgorithm: async (event: APIGatewayEventIncludeConnectionName) => {
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

  setAlgorithmStatus: async (event: APIGatewayEventIncludeConnectionName) => {
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

    const reason = reqBody?.reason || "";

    changeStatus === "REPORTED"
      ? await (async () => {
          await algorithmRepo.setAlgorithmStatus(numericId, reason, "REPORTED");
          userData.subId
            ? getCustomRepository(
                ReportAlgorithmRepository,
                event.connectionName,
              ).report(userData.subId, numericId)
            : 1;
        })()
      : 1;

    if (!userData?.isAdmin && changeStatus !== "REPORTED") {
      throw new HttpException("JL010");
    }

    userData?.isAdmin
      ? await algorithmRepo.setAlgorithmStatus(numericId, reason, changeStatus)
      : 1;

    const algorithm = await algorithmRepo.getBaseAlgorithmByIdx(numericId);

    await sendAlgorithmMessageOfStatus[changeStatus](algorithm);
    return createRes({ data: algorithm });
  },

  getAlgorithmCountAtAll: async (connectionName: string) =>
    createRes({
      data: await getCustomRepository(
        AlgorithmRepository,
        connectionName,
      ).getAlgorithmCountAtAll(),
    }),

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
};
