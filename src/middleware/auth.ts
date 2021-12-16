import { APIGatewayEvent } from "aws-lambda";
import { SSL_OP_COOKIE_EXCHANGE } from "constants";
import { access } from "fs";
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
      let newAccessToken = '';
      let newRefreshToken = '';
      
      const access1 = accessToken == null ? 
        (refreshToken == null ? (
          createErrorRes({
            errorCode: ERROR_CODE.JL001,
            status: 401,
          })
        ) : 
        (newAccessToken = jwt.sign({
          nickname: '민도현',
          sub: 'hihihihihih',
          email: 'secret@naver.com',
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
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
              expiresIn: '30d',
              issuer: 'seungwon'
            }), createRes({
              body: {
                newRefreshToken
              }
            })) :
          originMethod.apply(this, args))
          
        return access1;

    }
  }
}