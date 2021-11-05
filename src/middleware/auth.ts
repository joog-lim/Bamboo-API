import { APIGatewayEvent } from "aws-lambda";

import { ALLOWED_ORIGINS, createErrorRes, ERROR_CODE } from "../util/http";

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
}
