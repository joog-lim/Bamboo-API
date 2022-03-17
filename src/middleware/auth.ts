import { APIGatewayEvent } from "aws-lambda";

import { ALLOWED_ORIGINS } from "../util/http";
import * as tokenUtil from "../util/token";
import { checkQuestionAnswer } from "../util/verify";
import { AccessTokenDTO, BaseTokenDTO } from "../DTO/user.dto";
import { APIGatewayEventIncludeDBName } from "../DTO/http.dto";
import { getAuthorizationByHeader, getBody } from "../util/req";
import { HttpException } from "../exception";
import { AlgorithmVerify } from "../DTO/algorithm.dto";

export function onlyOrigin(_: any, __: string, desc: PropertyDescriptor) {
  const originMethod = desc.value; // get function with a decorator on it.
  desc.value = async function (...args: any[]) {
    // argument override
    const req: APIGatewayEvent = args[0];

    const origin = req.headers.Origin || req.headers.origin || "";
    if (!ALLOWED_ORIGINS.includes(origin) && origin) {
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

    const token: string =
      req.headers.Authorization || req.headers.authorization || "";

    const decodedToken = tokenUtil.verifyToken(token) as BaseTokenDTO;
    if (decodedToken?.tokenType !== tokenUtil.TokenTypeList.accessToken) {
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
    const req: APIGatewayEventIncludeDBName = args[0];

    const authorization = getAuthorizationByHeader(req.headers);
    const isLogin: boolean = !!tokenUtil.verifyToken(authorization);

    if (!isLogin) {
      const body = getBody<AlgorithmVerify>(req.body);

      const verifyId = body.verify?.id;
      const answer = body.verify?.answer;

      if (!(verifyId && answer)) {
        throw new HttpException("JL003");
      }

      if (await checkQuestionAnswer(verifyId, answer, req.connectionName)) {
        return originMethod.apply(this, args);
      } else {
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
    const password = req.headers.Authorization;

    if (password != process.env.ADMIN_PASSWORD) {
      throw new HttpException("JL002");
    }
    return originMethod.apply(this, args);
  };
}

export function onlyAdmin(_: any, __: string, desc: PropertyDescriptor) {
  const originMethod = desc.value;

  desc.value = async function (...args: any[]) {
    const req: APIGatewayEventIncludeDBName = args[0];
    const token: string = getAuthorizationByHeader(req.headers);

    const data = tokenUtil.verifyToken(token) as AccessTokenDTO;

    if (!data?.isAdmin) {
      throw new HttpException("JL002");
    }

    return originMethod.apply(this, args);
  };
}
