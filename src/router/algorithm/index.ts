import { APIGatewayEvent } from "aws-lambda";
import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { AlgorithmService } from "./algorithm.service";

export class AlgorithmRouter {
  static async getAlgorithmCountAtAll() {}
  static async getAlgorithmRules() {}
  static async getAlgorithmRulesForWeb() {}

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmList(event: APIGatewayEvent, _: any) {
    return AlgorithmService.getAlgorithmList(event);
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmListAtPages(event: APIGatewayEvent, _: any) {
    return AlgorithmService.getAlgorithmListAtPage(event);
  }
  
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  static async getAlgorithmCountAtAll(_: APIGatewayEvent, __: any) {
    return AlgorithmService.getAlgorithmCountAtAll();
  }

  static async getAlgorithmRules(_: APIGatewayEvent, __: any) {
    return AlgorithmService.getAlgorithmRules();
  }

  static async getAlgorithmRulesForWeb(_: APIGatewayEvent, __: any) {
    return AlgorithmService.getAlgorithmRulesForWeb();
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.authUserByVerifyQuestionOrToken
  static async wirteAlgorithm(event: APIGatewayEvent, _: any, __: Function) {
    return AlgorithmService.writeAlgorithm(JSON.parse(event.body));
  }

  static async setAlgorithmStatus() {}

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  static async modifyAlgorithmContent(event: APIGatewayEvent, _: any) {
    return AlgorithmService.modifyAlgorithmContent(event);
  }

  static async reportAlgorithm() {}

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.onlyAdmin
  static async deleteAlgorithm(event: APIGatewayEvent, _: any) {
    return AlgorithmService.deleteAlgorithm(event);
  }
}
