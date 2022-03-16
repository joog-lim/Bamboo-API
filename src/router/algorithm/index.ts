import { APIGatewayEvent } from "aws-lambda";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import {
  AuthMiddleware,
  DBMiddleware,
  AlgorithmMiddleware,
} from "../../middleware";
import { HttpErrorException } from "../../middleware/error";
import { AlgorithmService } from "./algorithm.service";

export class AlgorithmRouter {
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmListByUser(
    event: APIGatewayEventIncludeDBName,
    _: any,
  ) {
    return AlgorithmService.getAlgorithmListByUser(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  static async getAlgorithmListByAdmin(
    event: APIGatewayEventIncludeDBName,
    _: any,
  ) {
    return AlgorithmService.getAlgorithmListByAdmin(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmCountAtAll(
    { connectionName }: APIGatewayEventIncludeDBName,
    __: any,
  ) {
    return AlgorithmService.getAlgorithmCountAtAll(connectionName);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  static async getAlgorithmRules(_: APIGatewayEvent, __: any) {
    return AlgorithmService.getAlgorithmRules();
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  static async getAlgorithmRulesForWeb(_: APIGatewayEvent, __: any) {
    return AlgorithmService.getAlgorithmRulesForWeb();
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.authUserByVerifyQuestionOrToken
  static async wirteAlgorithm(
    event: APIGatewayEventIncludeDBName,
    _: any,
    __: Function,
  ) {
    return AlgorithmService.writeAlgorithm(
      JSON.parse(event.body),
      event.connectionName,
    );
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AlgorithmMiddleware.checkAlgorithm("param")
  static async setAlgorithmStatus(event: APIGatewayEventIncludeDBName, _: any) {
    return AlgorithmService.setAlgorithmStatus(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  @AlgorithmMiddleware.checkAlgorithm("param")
  static async modifyAlgorithmContent(
    event: APIGatewayEventIncludeDBName,
    _: any,
  ) {
    return AlgorithmService.modifyAlgorithmContent(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  @AlgorithmMiddleware.checkAlgorithm("param")
  static async deleteAlgorithm(event: APIGatewayEventIncludeDBName, _: any) {
    return AlgorithmService.deleteAlgorithm(event);
  }
}
