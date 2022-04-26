import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import {
  AuthMiddleware,
  DBMiddleware,
  HttpErrorException,
} from "../../middleware";
import { CommentService } from "./comment.service";

export class CommentRouter {
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async addComment(event: APIGatewayEventIncludeConnectionName) {
    return CommentService.addComment(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async deleteComment(event: APIGatewayEventIncludeConnectionName) {
    return CommentService.deleteComment(event);
  }
}
