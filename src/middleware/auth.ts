import { APIGatewayEvent } from "aws-lambda";

import { ALLOWED_ORIGINS } from "../util/http";
import * as tokenUtil from "../util/token";
import { APIGatewayEventIncludeConnectionName } from "../DTO/http.dto";
import { getAuthorizationByHeader, getBody } from "../util/req";
import { HttpException } from "../exception";
import { CheckVerifyDTO } from "../DTO/algorithm.dto";
import { includes } from "@fxts/core";
import { TokenTypeList } from "../DTO/token.dto";
import { getCustomRepository } from "typeorm";
import { Question } from "../entity";
import { QuestionRepository } from "../repository";

export function onlyOrigin(_: any, __: string, desc: PropertyDescriptor) {
  const originMethod = desc.value; // get function with a decorator on it.
  desc.value = async function (...args: any[]) {
    // argument override
    const req: APIGatewayEvent = args[0];

    const origin = req.headers.Origin || req.headers.origin || "";
    if (!includes(origin, ALLOWED_ORIGINS)) {
      // ignore request from not allowed origin
      throw new HttpException("JL001");
    }
    // run function
    return originMethod.apply(this, args);
  };
}

export function checkAccessToken(_: any, __: string, desc: PropertyDescriptor) {
  const originMethod = desc.value;

  desc.value = async function (...args: any[]) {
    const req: APIGatewayEvent = args[0];

    const token: string = getAuthorizationByHeader(req.headers);

    const decodedToken = tokenUtil.verifyToken(token);
    if (decodedToken?.tokenType !== TokenTypeList.accessToken) {
      throw new HttpException("JL008");
    }

    return originMethod.apply(this, args);
  };
}

export function authUserByVerifyQuestionOrToken(
  _: any,
  __: string,
  desc: PropertyDescriptor,
) {
  const originMethod = desc.value;

  desc.value = async function (...args: any[]) {
    const req: APIGatewayEventIncludeConnectionName = args[0];

    const authorization = getAuthorizationByHeader(req.headers);

    if (
      tokenUtil.verifyToken(authorization)?.tokenType !==
      TokenTypeList.accessToken
    ) {
      const verify = getBody<CheckVerifyDTO>(req.body).verify;

      const verifyId = verify?.id;
      const answer = verify?.answer;

      if (!(verifyId && answer)) {
        throw new HttpException("JL003");
      }

      const questionRepo = getCustomRepository(
        QuestionRepository,
        req.connectionName,
      );

      if (!(await questionRepo.checkQuestionAnswer(verifyId, answer))) {
        throw new HttpException("JL011");
      }
    }

    return originMethod.apply(this, args);
  };
}

export function authAdminPassword(
  _: any,
  __: string,
  desc: PropertyDescriptor,
) {
  const originMethod = desc.value;

  desc.value = async function (...args: any[]) {
    const req: APIGatewayEvent = args[0];
    const password = getAuthorizationByHeader(req.headers);

    if (password != process.env.ADMIN_PASSWORD) {
      throw new HttpException("JL002");
    }
    return originMethod.apply(this, args);
  };
}

export function onlyAdmin(_: any, __: string, desc: PropertyDescriptor) {
  const originMethod = desc.value;

  desc.value = async function (...args: any[]) {
    const req: APIGatewayEventIncludeConnectionName = args[0];
    const token: string = getAuthorizationByHeader(req.headers);

    const data = tokenUtil.verifyToken(token);

    if (!data?.isAdmin) {
      throw new HttpException("JL002");
    }

    return originMethod.apply(this, args);
  };
}
