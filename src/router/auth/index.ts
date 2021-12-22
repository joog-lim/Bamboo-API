import { APIGatewayEvent, Context } from "aws-lambda";
import { createRes, createErrorRes, ERROR_CODE } from "../../util/http";
import { getIsStudent } from "../../util/verify"
import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { AuthService } from "./auth.service";
import { getRepository } from "typeorm";
import { User } from '../../entity'
import jwt_decode from "jwt-decode";
import jwt from "jsonwebtoken";
import "dotenv/config"

export class AuthRouter {
  @DBMiddleware.connectTypeOrm
  static async login(
    event: APIGatewayEvent,
    __: any,
    ___: Function
  ) {
    const tokens : any = event.headers.id_token;
    if(!tokens) {
      return createErrorRes({
        errorCode: ERROR_CODE.JL005,
        status: 400
      })
    }
    const decode : any = jwt_decode(tokens);
    const email = decode.email;
    const isStudent = await getIsStudent(email)
    const repo = getRepository(User)
    const getUserSubId = await repo.find({
      select : ["subId"],
      where: {subId: decode.sub}
    })
    if(getUserSubId.length === 0) {
      try {
        await getRepository(User).insert({
          subId: decode.sub,
          email: decode.email,
          nickname: decode.name,
          isStudent: isStudent,
        })
      } catch (e) {
        console.error(e)
        return createErrorRes({ errorCode: ERROR_CODE.JL004, status: 500 });
      }
    } else {
      try {
        await getRepository(User).update({
          email: decode.email
        }, {
          nickname: decode.name,
          isStudent: isStudent
        })
      } catch (e) {
        console.error(e);
        return createErrorRes({ errorCode: ERROR_CODE.JL004, status: 500})
      }
    }
    const accessToken = jwt.sign({
      nickname: decode.name,
      sub: decode.sub,
      email: decode.email,
    },
    process.env.JWT_SECRET, 
    { 
      expiresIn: '1h',
      issuer: 'joog-lim.info'
    })
    const refreshToken = jwt.sign({},
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
        issuer: 'joog-lim.info'
      });
    return createRes({
      body: {
        accessToken,
        refreshToken
      }
    });
  }

  static async logOut() {}

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getVerifyQuestion(_: APIGatewayEvent, __: Context) {
    return AuthService.getVerifyQuestion();
  }

  @AuthMiddleware.authAdminPassword
  @DBMiddleware.connectTypeOrm
  static async addVerifyQuestion(event: APIGatewayEvent, _: Context) {
    return AuthService.addVerifyQuestion(JSON.parse(event.body));
  }
}
