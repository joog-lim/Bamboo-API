import { APIGatewayEvent, Context } from "aws-lambda";
import { google, Auth } from "googleapis";
import jwt_decode from "jwt-decode";
import { User } from '../../entity'
import jwt from "jsonwebtoken";
import "dotenv/config"
import { createRes, createErrorRes, ERROR_CODE } from "../../util/http";
import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { AuthService } from "./auth.service";
import { getRepository } from "typeorm";
import { parse } from "path/posix";

const oauth2Client : Auth.OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECURITY,
  "http://localhost:3000/apiV3/auth"
)
const redirectUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ['profile', 'email']
})
console.log(redirectUrl)



export class AuthRouter {
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.verifyToken
  static async login(
    event: APIGatewayEvent,
    __: any,
    ___: Function
  ) {
    return createRes({
      body: {
        message: '토큰 보유중'
      }
    });
  }
  @DBMiddleware.connectTypeOrm
  static async auth(
    event: APIGatewayEvent,
    __: any,
    ___: Function
  ) {
    const code = event.queryStringParameters.code;
    if(!code) {
      return createRes({
        body: {
          message: 'code값이 없습니다.'
        }
      })
    }
    const { tokens } = await oauth2Client.getToken(code);
    const decode : any = jwt_decode(tokens.id_token);
    const year = parseInt(decode.email.substring(1, 3))
    const nowYear = parseInt(String(new Date().getFullYear()).substring(2, 4))
    const isStudent = nowYear % year == 0 ? true : (nowYear % year == 1 ? true : nowYear % year == 2 ? true : false)
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
          isAdmin: false
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
          subId: decode.sub,
          nickname: decode.name,
          isStudent: isStudent,
          isAdmin: false
        })
      } catch (e) {
        console.error(e);
        return createErrorRes({ errorCode: ERROR_CODE.JL004, status: 500})
      }
    }
    
    console.log(decode);
    oauth2Client.setCredentials(tokens)
    const accessToken = jwt.sign({
      nickname: decode.name,
      sub: decode.sub,
      email: decode.email,
    },
    process.env.JWT_SECRET, 
    { 
      expiresIn: '1m',
      issuer: 'seungwon'
    })
    const refreshToken = jwt.sign({},
      process.env.JWT_SECRET,
      {
        expiresIn: '3m',
        issuer: 'seungwon'
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
