import { APIGatewayEvent } from "aws-lambda";
import { AuthMiddleware } from "../../middleware/auth";
import { AlgorithmService } from "./algorithm.service";

export class AlgorithmRouter {
  static async getAlgorithmCountAtAll() {}
  static async getAlgorithmRules() {}
  static async getAlgorithmRulesForWeb() {}
  static async getAlgorithmList() {}
  static async getAlgorithmListAtPages() {}

  @AuthMiddleware.onlyOrigin
  static async wirteAlgorithm(event: APIGatewayEvent, _: any, __: Function) {
    return AlgorithmService.writeAlgorithm(event);
  }
  static async setAlgorithmStatus() {}
  static async modifyAlgorithmContent() {}
  static async reportAlgorithm() {}
  static async deleteAlgorithm() {}
}
