import { Context } from "aws-lambda";
import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import { QuestionDTO } from "../../DTO/question.dto";
import { AuthMiddleware, DBMiddleware } from "../../middleware";
import { HttpErrorException } from "../../middleware/error";
import { getBody } from "../../util/req";

import { AuthService } from "./auth.service";

export class AuthRouter {
  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async login(
    event: APIGatewayEventIncludeConnectionName,
    __: any,
    ___: Function,
  ) {
    return AuthService.login(event);
  }

  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async appleLogin(
    event: APIGatewayEventIncludeConnectionName,
    _: any,
    __: Function,
  ) {
    return await AuthService.appleLogin(event);
  }
  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async authAuthenticationNumber(
    event: APIGatewayEventIncludeConnectionName,
    _: any,
    __: Function,
  ) {
    return AuthService.authAuthenticationNumber(event);
  }
  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async sendEmail(
    event: APIGatewayEventIncludeConnectionName,
    _: any,
    __: Function,
  ) {
    return AuthService.sendAuthEmail(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getVerifyQuestion(
    { connectionName }: APIGatewayEventIncludeConnectionName,
    __: Context,
  ) {
    return AuthService.getVerifyQuestion(connectionName);
  }

  @HttpErrorException
  @AuthMiddleware.authAdminPassword
  @DBMiddleware.connectTypeOrm
  static async addVerifyQuestion(
    event: APIGatewayEventIncludeConnectionName,
    _: Context,
  ) {
    return AuthService.addVerifyQuestion(
      getBody<QuestionDTO>(event.body),
      event.connectionName,
    );
  }
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getTokenByRefreshToken(
    { headers, connectionName }: APIGatewayEventIncludeConnectionName,
    __: Context,
  ) {
    return AuthService.getTokenByRefreshToken(
      headers.Authorization || headers.authorization,
      connectionName,
    );
  }
}
