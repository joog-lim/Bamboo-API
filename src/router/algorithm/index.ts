import { APIGatewayEvent } from "aws-lambda";
import { BaseAlgorithmDTO } from "../../DTO/algorithm.dto";
import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import {
  AuthMiddleware,
  DBMiddleware,
  AlgorithmMiddleware,
} from "../../middleware";
import { HttpErrorException } from "../../middleware/error";
import { getBody } from "../../util/req";
import {
  deleteAlgorithm,
  getAlgorithmByIdx,
  getAlgorithmCountAtAll,
  getAlgorithmLists,
  getAlgorithmRules,
  getAlgorithmRulesForWeb,
  modifyAlgorithmContent,
  setAlgorithmStatus,
  writeAlgorithm,
} from "./service";

export class AlgorithmRouter {
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmByUser(event: APIGatewayEventIncludeConnectionName) {
    return getAlgorithmByIdx("user")(event);
  }
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmListByUser(
    event: APIGatewayEventIncludeConnectionName,
  ) {
    return getAlgorithmLists("user")(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  static async getAlgorithmListByAdmin(
    event: APIGatewayEventIncludeConnectionName,
  ) {
    return getAlgorithmLists("admin")(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmCountAtAll({
    connectionName,
  }: APIGatewayEventIncludeConnectionName) {
    return getAlgorithmCountAtAll(connectionName);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  static async getAlgorithmRules(_: APIGatewayEvent) {
    return getAlgorithmRules();
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  static async getAlgorithmRulesForWeb(_: APIGatewayEvent) {
    return getAlgorithmRulesForWeb();
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.authUserByVerifyQuestionOrToken
  static async wirteAlgorithm(event: APIGatewayEventIncludeConnectionName) {
    return writeAlgorithm(
      getBody<BaseAlgorithmDTO>(event.body),
      event.connectionName,
    );
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AlgorithmMiddleware.checkAlgorithm("param")
  static async setAlgorithmStatus(event: APIGatewayEventIncludeConnectionName) {
    return setAlgorithmStatus(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  @AlgorithmMiddleware.checkAlgorithm("param")
  static async modifyAlgorithmContent(
    event: APIGatewayEventIncludeConnectionName,
  ) {
    return modifyAlgorithmContent(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  @AlgorithmMiddleware.checkAlgorithm("param")
  static async deleteAlgorithm(event: APIGatewayEventIncludeConnectionName) {
    return deleteAlgorithm(event);
  }
}
