import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import { AlgorithmMiddleware } from "../../middleware/algorithm";
import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
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
