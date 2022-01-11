import { APIGatewayEvent } from "aws-lambda";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { AlgorithmService } from "./algorithm.service";

export class AlgorithmRouter {
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmList(event: APIGatewayEventIncludeDBName, _: any) {
    return AlgorithmService.getAlgorithmList(event);
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmListAtPages(
    event: APIGatewayEventIncludeDBName,
    _: any
  ) {
    return AlgorithmService.getAlgorithmListAtPage(event);
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmCountAtAll(
    { connectionName }: APIGatewayEventIncludeDBName,
    __: any
  ) {
    return AlgorithmService.getAlgorithmCountAtAll(connectionName);
  }

  @AuthMiddleware.onlyOrigin
  static async getAlgorithmRules(_: APIGatewayEvent, __: any) {
    return AlgorithmService.getAlgorithmRules();
  }

  @AuthMiddleware.onlyOrigin
  static async getAlgorithmRulesForWeb(_: APIGatewayEvent, __: any) {
    return AlgorithmService.getAlgorithmRulesForWeb();
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.authUserByVerifyQuestionOrToken
  static async wirteAlgorithm(
    event: APIGatewayEventIncludeDBName,
    _: any,
    __: Function
  ) {
    return AlgorithmService.writeAlgorithm(
      JSON.parse(event.body),
      event.connectionName
    );
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async setAlgorithmStatus(event: APIGatewayEventIncludeDBName, _: any) {
    return AlgorithmService.setAlgorithmStatus(event);
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  static async modifyAlgorithmContent(
    event: APIGatewayEventIncludeDBName,
    _: any
  ) {
    return AlgorithmService.modifyAlgorithmContent(event);
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  static async deleteAlgorithm(event: APIGatewayEventIncludeDBName, _: any) {
    return AlgorithmService.deleteAlgorithm(event);
  }
}
