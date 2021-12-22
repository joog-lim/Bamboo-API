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


// const oauth2Client : Auth.OAuth2Client = new google.auth.OAuth2(                          
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECURITY,
//   "http://localhost:3000/apiV3/auth"          
// )
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
    const tokens : any = event.headers.id_token;
    if(!tokens) {
      return createRes({
        body: {
          message: 'token값이 없습니다.',
          status: 400
        }
      })
    }
    const decode : any = jwt_decode(tokens);
    const email = decode.email;
    const isStudent = getIsStudent(email)
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
    
    console.log(decode);
    // oauth2Client.setCredentials(tokens)
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
        expiresIn: '30d',
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
