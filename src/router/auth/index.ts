import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import { QuestionDTO } from "../../DTO/question.dto";
import { AuthMiddleware, DBMiddleware } from "../../middleware";
import { HttpErrorException } from "../../middleware/error";
import { getBody } from "../../util/req";
import {
  signUp,
  login,
  mailSend,
  mailAuth,
  addVerifyQuestion,
  getTokenByRefreshToken,
  getVerifyQuestion,
} from "./service";

export class AuthRouter {
  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async signUp(event: APIGatewayEventIncludeConnectionName) {
    return signUp(event);
  }

  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async login(event: APIGatewayEventIncludeConnectionName) {
    return login(event);
  }

  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async mailSend(event: APIGatewayEventIncludeConnectionName) {
    return mailSend(event);
  }

  @HttpErrorException
  @DBMiddleware.connectTypeOrm
  static async mailAuth(event: APIGatewayEventIncludeConnectionName) {
    return mailAuth(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getVerifyQuestion({
    connectionName,
  }: APIGatewayEventIncludeConnectionName) {
    return getVerifyQuestion(connectionName);
  }

  @HttpErrorException
  @AuthMiddleware.authAdminPassword
  @DBMiddleware.connectTypeOrm
  static async addVerifyQuestion(event: APIGatewayEventIncludeConnectionName) {
    return addVerifyQuestion(
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
    return getTokenByRefreshToken(
      headers.Authorization || headers.authorization || "",
      connectionName,
    );
  }
}
