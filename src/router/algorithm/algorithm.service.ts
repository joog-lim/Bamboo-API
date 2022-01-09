import { APIGatewayEvent } from "aws-lambda";
import { getCustomRepository, getRepository } from "typeorm";

import {
  AlgorithmStatusType,
  BaseAlgorithmDTO,
  ModifyAlgorithmDTO,
} from "../../DTO/algorithm.dto";
import { bold13, bold15, ruleForWeb, rules } from "../../config";
import { Algorithm } from "../../entity";

import { AlgorithmRepository } from "../../repository/algorithm";

import { getLastPostNumber } from "../../util/algorithm";
import { createErrorRes, createRes } from "../../util/http";
import { isNumeric } from "../../util/number";
import {
  algorithemDeleteEvenetMessage,
  sendAlgorithmMessageOfStatus,
} from "../../util/discord";
import { AccessTokenDTO } from "../../DTO/user.dto";
import { getIsAdminAndSubByAccessToken } from "../../util/user";
import { verifyToken } from "../../util/token";

export const AlgorithmService: { [k: string]: Function } = {
  writeAlgorithm: async ({ title, content, tag }: BaseAlgorithmDTO) => {
    if (!checkArgument(title, content, tag)) {
      return createErrorRes({ errorCode: "JL003" });
    }
    try {
      await getRepository(Algorithm).insert({
        algorithmNumber: (await getLastPostNumber("PENDING")) + 1,
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

    const { isAdmin, sub } = getIsAdminAndSubByAccessToken(
      event.headers.Authorization ?? event.headers.authorization
    );

    const algorithmRepo = getCustomRepository(AlgorithmRepository);
    const algorithmList = await algorithmRepo.getListByCursor({
      count: Number(count) === 0 ? null : Number(count),
      cursor: parseInt(cursor),
      status: status as AlgorithmStatusType,
      isAdmin,
    });

    const algorithmCount = algorithmList.length;
    if (algorithmCount === 0) {
      return createRes({ body: {} });
    }

    const firstNumber = algorithmList[0].algorithmNumber;
    const lastNumber = algorithmList[algorithmCount - 1].algorithmNumber;

    const isClickedByUser = await algorithmRepo.getIsClickedAlgorithmByUser(
      firstNumber,
      lastNumber,
      sub,
      status as AlgorithmStatusType
    );

    for (let i = 0, j = 0; i < algorithmList.length; i++) {
      const isClicked = isClickedByUser[j]?.idx === algorithmList[i].idx;
      isClicked && j++;

      algorithmList[i] = Object.assign(
        {},
        algorithmList[i],
        isClicked ? { isClicked: true } : { isClicked: false },
        { emojiCount: algorithmList[i].emojis.length }
      );
    }

    return createRes({
      body: algorithmList,
    });
  },

  getAlgorithmListAtPage: async (event: APIGatewayEvent) => {
    const { count, page, status } = event.queryStringParameters;

    if (!isNumeric(count) || !isNumeric(page)) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const { isAdmin, sub } = getIsAdminAndSubByAccessToken(
      event.headers.Authorization ?? event.headers.authorization
    );

    const algorithmRepo = getCustomRepository(AlgorithmRepository);

    const algorithmList = await algorithmRepo.getListByPage({
      count: Number(count) === 0 ? 1 : Number(count),
      page: parseInt(page),
      status: status as AlgorithmStatusType,
      isAdmin,
    });

    const algorithmCount = algorithmList.length;
    if (algorithmCount === 0) {
      return createRes({ body: {} });
    }

    const firstNumber = algorithmList[0].algorithmNumber;
    const lastNumber = algorithmList[algorithmCount - 1].algorithmNumber;

    const isClickedByUser = await algorithmRepo.getIsClickedAlgorithmByUser(
      firstNumber,
      lastNumber,
      sub,
      status as AlgorithmStatusType
    );

    console.log(isClickedByUser);
    for (let i = 0, j = 0; i < algorithmList.length; i++) {
      const isClicked = isClickedByUser[j]?.idx === algorithmList[i].idx;
      isClicked && j++;

      algorithmList[i] = Object.assign(
        {},
        algorithmList[i],
        isClicked ? { isClicked: true } : { isClicked: false },
        { emojiCount: algorithmList[i].emojis.length }
      );
    }
    return createRes({ body: algorithmList });
  },

  getAlgorithmCountAtAll: async () => {
    const result = await getCustomRepository(
      AlgorithmRepository
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

    const { title, content, tag } = await algorithmRepo.getBaseAlgorithmByIdx(
      Number(id)
    );

    await algorithemDeleteEvenetMessage({ title, content, tag });
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

    const reqBody = JSON.parse(event.body);

    const changeStatus = reqBody?.status as AlgorithmStatusType;
    if (changeStatus || changeStatus === "PENDING") {
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
