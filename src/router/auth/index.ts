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
  static async login(event: APIGatewayEventIncludeConnectionName) {
    return AuthService.login(event);
  }

  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async appleLogin(event: APIGatewayEventIncludeConnectionName) {
    return await AuthService.appleLogin(event);
  }
  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async authAuthenticationNumber(
    event: APIGatewayEventIncludeConnectionName,
  ) {
    return AuthService.authAuthenticationNumber(event);
  }
  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async sendEmail(event: APIGatewayEventIncludeConnectionName) {
    return AuthService.sendAuthEmail(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getVerifyQuestion({
    connectionName,
  }: APIGatewayEventIncludeConnectionName) {
    return AuthService.getVerifyQuestion(connectionName);
  }

  @HttpErrorException
  @AuthMiddleware.authAdminPassword
  @DBMiddleware.connectTypeOrm
  static async addVerifyQuestion(event: APIGatewayEventIncludeConnectionName) {
    return AuthService.addVerifyQuestion(
      getBody<QuestionDTO>(event.body),
      event.connectionName,
    );
  }
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getTokenByRefreshToken({
    headers,
    connectionName,
  }: APIGatewayEventIncludeConnectionName) {
    return AuthService.getTokenByRefreshToken(
      headers.Authorization || headers.authorization,
      connectionName,
    );
  }
}
