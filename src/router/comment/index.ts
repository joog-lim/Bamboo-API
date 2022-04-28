import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import {
  AuthMiddleware,
  DBMiddleware,
  HttpErrorException,
} from "../../middleware";
import { addComment, deleteComment } from "./service";

export class CommentRouter {
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async addComment(event: APIGatewayEventIncludeConnectionName) {
    return addComment(event);
  }

  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async deleteComment(event: APIGatewayEventIncludeConnectionName) {
    return deleteComment(event);
  }
}
