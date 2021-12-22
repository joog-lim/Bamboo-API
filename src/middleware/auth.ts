import { APIGatewayEvent } from "aws-lambda";
import { getRepository } from "typeorm";
import { ALLOWED_ORIGINS, createErrorRes, createRes, ERROR_CODE } from "../util/http";
import { decodeToken } from "../util/token"
import { checkQuestionAnswer } from "../util/verify";
import { User } from '../entity'
import jwt, { JwtPayload } from "jsonwebtoken"
import jwt_decode from "jwt-decode";
export class AuthMiddleware {
  static onlyOrigin(_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value; // get function with a decorator on it.
    desc.value = async function (...args: any[]) {

      // argument override
      const req: APIGatewayEvent = args[0];
      const origin = req.headers.Origin || req.headers.origin;
      if (!ALLOWED_ORIGINS.includes(origin) && origin) {
        // ignore request from not allowed origin
        return createErrorRes({
          errorCode: ERROR_CODE.JL001, 
          status: 401,
        });
      }
      // run function
      return originMethod.apply(this, args);
    };
  }

  static verifyToken(_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value; 
    desc.value = async function (...args: any[]) {

      const req: APIGatewayEvent = args[0];
      const accessToken: string | JwtPayload = await decodeToken(req.headers.accessToken);
      const decodeAccessToken: string | JwtPayload = await jwt_decode(req.headers.accessToken)
      const refreshToken: string | JwtPayload = await decodeToken(req.headers.refreshToken) 
      const repo = getRepository(User);
      let id: any = {}
      if(accessToken === null) {
          id = await repo.find({
          select: ["subId", "email", "nickname"],
          where: {subId : decodeAccessToken.sub}
        })
      }

      if(accessToken === null) {
        if(refreshToken === null) {
          return createErrorRes({
            errorCode: ERROR_CODE.JL001, 
            status: 401,
          });
        } else {
          const newAccessToken = jwt.sign({
            nickname: id[0].nickname,
            sub: id[0].subId,
            email: id[0].email,
          },
          process.env.JWT_SECRET, 
          { 
            expiresIn: '1h',
            issuer: 'joog-lim.info'
          })
          return createRes({
            body: {
              newAccessToken
            }
          })
        }
      } else {
        if(refreshToken === null) {
          const newRefreshToken = jwt.sign({},
            process.env.JWT_SECRET,
            {
              expiresIn: '30d',
              issuer: 'joog-lim.info'
            })
          return createRes({
            body: {
              newRefreshToken
            }
          })
        } else {
          return originMethod.apply(this, args);
        }
      }
    }

  }
  static authUserByVerifyQuestionOrToken(
    _: any,
    __: string,
    desc: PropertyDescriptor
  ) {
    const originMethod = desc.value;

    desc.value = async function (...args: any[]) {
      const req: APIGatewayEvent = args[0];

      const authorization = req.headers.Authorization;
      const isLogin: boolean = false; // TODO 유저 있는지 체크 로직 추가

      if (!isLogin) {
        const body = JSON.parse(req.body);
        const verifyId = body.verify.id;
        const answer = body.verify.answer;
        return (await checkQuestionAnswer(verifyId, answer))
          ? originMethod.apply(this, args)
          : createErrorRes({ errorCode: ERROR_CODE.JL002, status: 401 });
      }
      return originMethod.apply(this, args);
    };
  }
  static authAdminPassword(_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value;

    desc.value = function (...args: any[]) {
      const req: APIGatewayEvent = args[0];
      const password = req.headers.Authorization;

      if (password != process.env.ADMIN_PASSWORD) {
        return createErrorRes({
          errorCode: ERROR_CODE.JL002,
          status: 401,
        });
      }
      return originMethod.apply(this, args);
    };
  }
}
