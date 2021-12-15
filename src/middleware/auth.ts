import { APIGatewayEvent } from "aws-lambda";
import { SSL_OP_COOKIE_EXCHANGE } from "constants";
import jwt from "jsonwebtoken"
import { ALLOWED_ORIGINS, createErrorRes, createRes, ERROR_CODE, decodeToken } from "../util/http";

export class AuthMiddleware {
  static onlyOrigin(_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value; // get function with a decorator on it.
    desc.value = function (...args: any[]) {
      // argument override
      const req: APIGatewayEvent = args[0];
      const origin = req.headers.origin;
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
      console.log(accessToken);
      console.log(refreshToken);

      if(accessToken === null) {
        if(refreshToken === null) {
          console.log('1')
          return createErrorRes({
            errorCode: ERROR_CODE.JL001, 
            status: 401,
          });
        } else {
          console.log(2)
          const newAccessToken = jwt.sign({
            nickname: '민도현',
            sub: 'djwadawkjkfkh',
            email: 'secret@naver.com',
          },
          'hawafafaw', 
          { 
            expiresIn: '1h',
            issuer: 'seungwon'
          })
          return createRes({
            body: {
              newAccessToken
            }
          })
        }
      } else {
        console.log(3)
        if(refreshToken === null) {
          console.log(4)
          const newRefreshToken = jwt.sign({},
            'hawafafaw',
            {
              expiresIn: '30d',
              issuer: 'seungwon'
            })
          return createRes({
            body: {
              newRefreshToken
            }
          })
        } else {
          console.log(5)
          return originMethod.apply(this, args);
        }
      }
      console.log('1', accessToken === null);
      console.log('2', refreshToken === null);
      return originMethod.apply(this, args);


      
    }
  }
}