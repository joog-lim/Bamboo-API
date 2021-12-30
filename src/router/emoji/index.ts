import { APIGatewayEvent } from "aws-lambda";
import { AuthMiddleware } from "../../middleware/auth";
import { DBMiddleware } from "../../middleware/database";
import { EmojiService } from "./emoji.service";

export class EmojiRouter {
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async addLeaf(event: APIGatewayEvent, _: any) {
    return EmojiService.addLeaf(event);
  }

  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async removeLeaf(event: APIGatewayEvent, _: any) {
    return EmojiService.removeLeaf(event);
  }
}
