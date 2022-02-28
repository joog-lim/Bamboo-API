import { Context } from "aws-lambda";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";

import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { AuthService } from "./auth.service";

export class AuthRouter {
  @DBMiddleware.connectTypeOrm
  static async login(
    event: APIGatewayEventIncludeDBName,
    __: any,
    ___: Function,
  ) {
    return AuthService.login(event);
  }

  @DBMiddleware.connectTypeOrm
  static async appleLogin(
    event: APIGatewayEventIncludeDBName,
    _: any,
    __: Function,
  ) {
    return await AuthService.appleLogin(event);
  }

  @DBMiddleware.connectTypeOrm
  static async authAuthenticationNumber(
    event: APIGatewayEventIncludeDBName,
    _: any,
    __: Function,
  ) {
    return AuthService.authAuthenticationNumber(event);
  }

  @DBMiddleware.connectTypeOrm
  static async sendEmail(
    event: APIGatewayEventIncludeDBName,
    _: any,
    __: Function,
  ) {
    return AuthService.sendAuthEmail(event);
  }
  static async logOut() {}

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getVerifyQuestion(
    { connectionName }: APIGatewayEventIncludeDBName,
    __: Context,
  ) {
    return AuthService.getVerifyQuestion(connectionName);
  }

  @AuthMiddleware.authAdminPassword
  @DBMiddleware.connectTypeOrm
  static async addVerifyQuestion(
    event: APIGatewayEventIncludeDBName,
    _: Context,
  ) {
    return AuthService.addVerifyQuestion(
      JSON.parse(event.body),
      event.connectionName,
    );
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getTokenByRefreshToken(
    { headers, connectionName }: APIGatewayEventIncludeDBName,
    __: Context,
  ) {
    return AuthService.getTokenByRefreshToken(
      headers.Authorization || headers.authorization,
      connectionName,
    );
  }
}
