import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import {
  AlgorithmMiddleware,
  AuthMiddleware,
  DBMiddleware,
} from "../../middleware";
import { HttpErrorException } from "../../middleware/error";

import { addLeaf, removeLeaf } from "./service";

export class EmojiRouter {
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  @AlgorithmMiddleware.checkAlgorithm("body")
  static async addLeaf(event: APIGatewayEventIncludeConnectionName) {
    return addLeaf(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  @AlgorithmMiddleware.checkAlgorithm("body")
  static async removeLeaf(event: APIGatewayEventIncludeConnectionName) {
    return removeLeaf(event);
  }
}
