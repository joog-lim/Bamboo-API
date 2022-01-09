import { APIGatewayEvent } from "aws-lambda";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { EmojiService } from "./emoji.service";

export class EmojiRouter {
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async addLeaf(event: APIGatewayEventIncludeDBName, _: any) {
    return EmojiService.addLeaf(event);
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async removeLeaf(event: APIGatewayEventIncludeDBName, _: any) {
    return EmojiService.removeLeaf(event);
  }
}
