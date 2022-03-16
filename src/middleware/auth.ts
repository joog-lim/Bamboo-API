import { APIGatewayEvent } from "aws-lambda";
import { getRepository } from "typeorm";

import { ALLOWED_ORIGINS, createErrorRes, createRes } from "../util/http";
import * as tokenUtil from "../util/token";
import { checkQuestionAnswer } from "../util/verify";
import { User } from "../entity";
import jwt, { JwtPayload } from "jsonwebtoken";
import { issuer } from "../config";
import { AccessTokenDTO, BaseTokenDTO } from "../DTO/user.dto";
import { APIGatewayEventIncludeDBName } from "../DTO/http.dto";

export function onlyOrigin(_: any, __: string, desc: PropertyDescriptor) {
  const originMethod = desc.value; // get function with a decorator on it.
  desc.value = async function (...args: any[]) {
    // argument override
    const req: APIGatewayEvent = args[0];

    const origin = req.headers.Origin || req.headers.origin;
    if (!ALLOWED_ORIGINS.includes(origin) && origin) {
      // ignore request from not allowed origin
      return createErrorRes({
        errorCode: "JL001",
        status: 401,
      });
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
      req.headers.Authorization || req.headers.authorization;

    const decodedToken = tokenUtil.verifyToken(token) as BaseTokenDTO;
    if (decodedToken?.tokenType !== tokenUtil.TokenTypeList.accessToken) {
      return createErrorRes({
        errorCode: "JL008",
        status: 401,
      });
    }

    return originMethod.apply(this, args);
  };
}
export function verifyToken(_: any, __: string, desc: PropertyDescriptor) {
  const originMethod = desc.value;
  desc.value = async function (...args: any[]) {
    const req: APIGatewayEventIncludeDBName = args[0];

    const { accessToken } = req.headers;
    const verifyAccessToken: string | JwtPayload =
      tokenUtil.verifyToken(accessToken);
    const decodeAccessToken: string | JwtPayload = jwt.decode(accessToken);
    const refreshToken: string | JwtPayload = tokenUtil.verifyToken(
      req.headers.refreshToken,
    );

    const repo = getRepository(User, req.connectionName);

    if (verifyAccessToken === null) {
      if (refreshToken === null) {
        return createErrorRes({
          errorCode: "JL005",
          status: 401,
        });
      } else {
        const id = await repo.find({
          select: ["subId", "email", "nickname"],
          where: { subId: decodeAccessToken.sub },
        });
        const newAccessToken = jwt.sign(
          {
            nickname: id[0].nickname,
            sub: id[0].subId,
            email: id[0].email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
            issuer,
          },
        );
        return createRes({
          body: {
            newAccessToken,
          },
        });
      }
    } else {
      if (refreshToken === null) {
        const newRefreshToken = jwt.sign({}, process.env.JWT_SECRET, {
          expiresIn: "30d",
          issuer,
        });
        return createRes({
          body: {
            newRefreshToken,
          },
        });
      } else {
        return originMethod.apply(this, args);
      }
    }
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

    const authorization = req.headers.Authorization;
    const isLogin: boolean = !!tokenUtil.verifyToken(authorization);

    if (!isLogin) {
      const body = JSON.parse(req.body);

      const verifyId = body.verify?.id;
      const answer = body.verify?.answer;

      if (!(verifyId && answer)) {
        return createErrorRes({ errorCode: "JL003" });
      }

      return (await checkQuestionAnswer(verifyId, answer, req.connectionName))
        ? originMethod.apply(this, args)
        : createErrorRes({ errorCode: "JL011", status: 401 });
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
      return createErrorRes({
        errorCode: "JL002",
        status: 401,
      });
    }
    return originMethod.apply(this, args);
  };
}

export function onlyAdmin(_: any, __: string, desc: PropertyDescriptor) {
  const originMethod = desc.value;

  desc.value = async function (...args: any[]) {
    const req: APIGatewayEventIncludeDBName = args[0];
    const token: string = req.headers.Authorization;

    const data = tokenUtil.verifyToken(token) as AccessTokenDTO;

    return data?.isAdmin
      ? originMethod.apply(this, args)
      : createErrorRes({ errorCode: "JL002", status: 401 });
  };
}
