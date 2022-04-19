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
  static async signUp(
    event: APIGatewayEventIncludeConnectionName,
    _: any,
    __: Function,
  ) {
    return AuthService.signUp(event);
  }

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
  static async mailSend(
    event: APIGatewayEventIncludeConnectionName,
    _: any,
    __: Function,
  ) {
    return AuthService.mailSend(event);
  }

  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async mailAuth(
    event: APIGatewayEventIncludeConnectionName,
    _: any,
    __: Function,
  ) {
    return AuthService.mailAuth(event);
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
