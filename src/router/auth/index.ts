import { APIGatewayEvent, Context } from "aws-lambda";

import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { AuthService } from "./auth.service";

export class AuthRouter {
  @DBMiddleware.connectTypeOrm
  static async login(event: APIGatewayEvent, __: any, ___: Function) {
    return AuthService.login(event);
  }

  static async logOut() {}

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getVerifyQuestion(_: APIGatewayEvent, __: Context) {
    return AuthService.getVerifyQuestion();
  }

  @AuthMiddleware.authAdminPassword
  @DBMiddleware.connectTypeOrm
  static async addVerifyQuestion(event: APIGatewayEvent, _: Context) {
    return AuthService.addVerifyQuestion(JSON.parse(event.body));
  }
}
