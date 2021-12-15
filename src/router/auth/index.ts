import { APIGatewayEvent } from "aws-lambda";
import { google, Auth } from "googleapis";
import jwt_decode from "jwt-decode";
import jwt from "jsonwebtoken";
import "dotenv/config"
// import { oauth2 } from "googleapis/build/src/apis/oauth2";
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

let auth = false;
export class AuthRouter {
  @AuthMiddleware.verifyToken
  static async login(
    event: APIGatewayEvent,
    __: any,
    ___: Function
  ) {
    let oatuh2 = google.oauth2({version: 'v2', auth: oauth2Client})
    console.log(this);
    return 'hi';
  }

  static async auth(
    event: APIGatewayEvent,
    __: any,
    ___: Function
  ) {
    // console.log('sibal', event)
    const code = event.queryStringParameters.code;
    if(!code) {
      return 'code where??'
    }
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens)
    const decode : any = jwt_decode(tokens.id_token);
    const accessToken = jwt.sign({
      nickname: decode.name,
      sub: decode.sub,
      email: decode.email,
      name: decode.name,
      picture: decode.picture,
    },
    'hawafafaw', 
    { 
      expiresIn: '1m',
      issuer: 'seungwon'
    })
    const refreshToken = jwt.sign({},
      'hawafafaw',
      {
        expiresIn: '3m',
        issuer: 'seungwon'
      });
    auth = true;


    // console.log(auth)
    // console.log(oauth2Client)
    console.log(decode);
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
