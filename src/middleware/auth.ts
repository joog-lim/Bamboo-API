import { APIGatewayEvent } from "aws-lambda";
import { getRepository } from "typeorm";
import { ALLOWED_ORIGINS, createErrorRes, createRes, ERROR_CODE, decodeToken } from "../util/http";
import { checkQuestionAnswer } from "../util/verify";
import { User } from '../entity'
import jwt from "jsonwebtoken"
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
      console.log(req.headers);
      const accessToken : any = await decodeToken(req.headers.accessToken);
      const refreshToken = await decodeToken(req.headers.refreshToken) 
      let id: any = '';
      const repo = getRepository(User);
      try {
        if(accessToken != null) {
          id = await repo.find({
            select: ["subId", "email", "nickname"],
            where: {subId : accessToken.sub}
          })
          console.log('id1', id);
        }
      } catch (e) {
        console.error(e);
        return createErrorRes({
          errorCode: ERROR_CODE.JL004,
          status: 401
        })
      }
      console.log('acc1', accessToken)
      console.log('id2', id);
      


      // const tokenRetention = accessToken == null ? 
      //   (refreshToken == null ? (
      //     createErrorRes({
      //       errorCode: ERROR_CODE.JL001,
      //       status: 401,
      //     })
      //   ) : 
      //   (newAccessToken = jwt.sign({
      //     nickname: id[0].nickname,
      //     email: id[0].email,
      //     sub: id[0].subId
      //   },
      //   process.env.JWT_SECRET,
      //   {
      //     expiresIn: '1h',
      //     issuer: 'seungwon'
      //   }), createRes({
      //     body: {
      //       newAccessToken
      //     }
      //   }))) :
      //   (refreshToken == null ? 
      //     (newRefreshToken = jwt.sign({},
      //       process.env.JWT_SECRET,
      //       {
      //         expiresIn: '30d',
      //         issuer: 'seungwon'
      //       }), createRes({
      //         body: {
      //           newRefreshToken
      //         }
      //       })) :
      //     originMethod.apply(this, args))
          
      //   return tokenRetention;
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
            nickname: id[0].nickname,
            sub: id[0].subId,
            email: id[0].email,
          },
          process.env.JWT_SECRET, 
          { 
            expiresIn: '1d',
            issuer: 'joog-lim.info'
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
          console.log(5)
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
