import { APIGatewayEvent } from "aws-lambda";

import { ALLOWED_ORIGINS } from "../util/http";
import * as tokenUtil from "../util/token";
import { getAuthorizationByHeader, getBody } from "../util/req";
import { HttpException } from "../exception";
import { CheckVerifyDTO } from "../DTO/algorithm.dto";
import { includes } from "@fxts/core";
import { TokenTypeList } from "../DTO/token.dto";
import { getCustomRepository } from "typeorm";
import { QuestionRepository } from "../repository";
import { Middleware } from "./type";

export const onlyOrigin: Middleware = (method) => async (event) => {
  const origin = event.headers.Origin || event.headers.origin || "";
  if (!includes(origin, ALLOWED_ORIGINS)) {
    throw new HttpException("JL001");
  }

  return await method(event);
};

export const checkAccessToken: Middleware = (method) => async (event) => {
  const token = getAuthorizationByHeader(event.headers);

  const decodedToken = tokenUtil.verifyToken(token);
  if (decodedToken?.tokenType !== TokenTypeList.accessToken) {
    throw new HttpException("JL008");
  }

  return method(event);
};

export const authUserByVerifyQuestionOrToken: Middleware =
  (method) => async (event) => {
    const authorization = getAuthorizationByHeader(event.headers);
    if (
      tokenUtil.verifyToken(authorization)?.tokenType !==
      TokenTypeList.accessToken
    ) {
      const verify = getBody<CheckVerifyDTO>(event.body).verify;

      const verifyId = verify?.id;
      const answer = verify?.answer;

      if (!(verifyId && answer)) {
        throw new HttpException("JL003");
      }

      const questionRepo = getCustomRepository(
        QuestionRepository,
        event.connectionName,
      );

      if (!(await questionRepo.checkQuestionAnswer(verifyId, answer))) {
        throw new HttpException("JL011");
      }
    }

    return method(event);
  };

export const authAdminPassword: Middleware = (method) => async (event) => {
  const pw = getAuthorizationByHeader(event.headers);
  if (pw !== process.env.ADMIN_PASSWORD) {
    throw new HttpException("JL002");
  }
  return method(event);
};

export const onlyAdmin: Middleware = (method) => async (event) => {
  const token: string = getAuthorizationByHeader(event.headers);
  const data = tokenUtil.verifyToken(token);

  if (!data?.isAdmin) {
    throw new HttpException("JL002");
  }

  return method(event);
};
