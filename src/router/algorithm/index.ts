import { APIGatewayEvent } from "aws-lambda";
import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { AlgorithmService } from "./algorithm.service";

export class AlgorithmRouter {
  static async getAlgorithmCountAtAll() {}
  static async getAlgorithmRules() {}
  static async getAlgorithmRulesForWeb() {}
  static async getAlgorithmList() {}
  static async getAlgorithmListAtPages() {}

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.authUserByVerifyQuestionOrToken
  static async wirteAlgorithm(event: APIGatewayEvent, _: any, __: Function) {
    return AlgorithmService.writeAlgorithm(JSON.parse(event.body));
  }
  static async setAlgorithmStatus() {}
  static async modifyAlgorithmContent() {}
  static async reportAlgorithm() {}
  static async deleteAlgorithm() {}
}
