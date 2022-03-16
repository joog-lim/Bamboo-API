import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import {
  AlgorithmMiddleware,
  AuthMiddleware,
  DBMiddleware,
} from "../../middleware";

import { EmojiService } from "./emoji.service";

export class EmojiRouter {
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  @AlgorithmMiddleware.checkAlgorithm("body")
  static async addLeaf(event: APIGatewayEventIncludeDBName, _: any) {
    return EmojiService.addLeaf(event);
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  @AlgorithmMiddleware.checkAlgorithm("body")
  static async removeLeaf(event: APIGatewayEventIncludeDBName, _: any) {
    return EmojiService.removeLeaf(event);
  }
}
