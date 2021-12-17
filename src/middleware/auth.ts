import { APIGatewayEvent } from "aws-lambda";
import { SSL_OP_COOKIE_EXCHANGE } from "constants";
import { access } from "fs";
import jwt from "jsonwebtoken"
import { getRepository } from "typeorm";
import { ALLOWED_ORIGINS, createErrorRes, createRes, ERROR_CODE, decodeToken } from "../util/http";
import { checkQuestionAnswer } from "../util/verify";
import { User } from '../entity'


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
      const accessToken = decodeToken(req.headers.accessToken);
      const refreshToken = decodeToken(req.headers.refreshToken) 
      let newAccessToken = '';
      let newRefreshToken = '';
      const repo = getRepository(User);
      const id = await repo.find({
        select: ["subId", "email", "nickname"],
        where: {nickname : "루이"}
      })


      const tokenRetention = accessToken == null ? 
        (refreshToken == null ? (
          createErrorRes({
            errorCode: ERROR_CODE.JL001,
            status: 401,
          })
        ) : 
        (newAccessToken = jwt.sign({
          nickname: id[0].nickname,
          email: id[0].email,
          sub: id[0].subId
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1m',
          issuer: 'seungwon'
        }), createRes({
          body: {
            newAccessToken
          }
        }))) :
        (refreshToken == null ? 
          (newRefreshToken = jwt.sign({},
            process.env.JWT_SECRET,
            {
              expiresIn: '3m',
              issuer: 'seungwon'
            }), createRes({
              body: {
                newRefreshToken
              }
            })) :
          originMethod.apply(this, args))
          
        return tokenRetention;

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
