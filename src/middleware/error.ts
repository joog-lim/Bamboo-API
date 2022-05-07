import { HttpException } from "../exception/http.exception";
import { Middleware } from "./type";

export const HttpErrorException: Middleware = (method) => {
  return async function (event) {
    try {
      const result = await method(event);
      return result;
    } catch (e) {
      if (e instanceof HttpException) {
        return e.createRes();
      } else {
        throw e;
      }
    }
  };
};
