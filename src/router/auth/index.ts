import { APIGatewayEvent } from "aws-lambda";
import { google, Auth } from "googleapis";
import jwt_decode from "jwt-decode";
import jwt from "jsonwebtoken";
import "dotenv/config"
import { createRes } from "../../util/http";
import { AuthMiddleware } from "../../middleware/auth";

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
    oauth2Client.setCredentials(tokens)
    const accessToken = jwt.sign({
      nickname: decode.name,
      sub: decode.sub,
      email: decode.email,
    },
    process.env.JWT_SECRET, 
    { 
      expiresIn: '1h',
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
  static async getVerifyQuestion() {}
}
