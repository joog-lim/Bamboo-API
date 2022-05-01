import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import {
  AuthMiddleware,
  DBMiddleware,
  HttpErrorException,
} from "../../middleware";
import modifyProfile from "./service";

export class ProfileRouter {
  @HttpErrorException
  @AuthMiddleware.onlyOrigin
  @DBMiddleware.connectTypeOrm
  @AuthMiddleware.checkAccessToken
  static async modifyProfile(event: APIGatewayEventIncludeConnectionName) {
    return modifyProfile(event);
  }
}
