import { ErrorCodeType, ErrorType, ERROR_CODE_LIST } from "./error-code";

export class HttpException extends Error {
  error: ErrorType;
  /**
   *  @example
   * `throw new HttpException("JL004")`
   *
   * */

  constructor(private readonly errorCode: ErrorCodeType) {
    super();
    this.error = ERROR_CODE_LIST[errorCode];
  }

  createRes() {
    return {
      statusCode: this.error.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        errorCode: this.errorCode,
        message: this.error.message,
      }),
    };
  }
}
