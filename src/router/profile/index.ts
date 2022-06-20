import { checkAccessToken, onlyOrigin } from "../../middleware/auth";
import { connectTypeOrm } from "../../middleware/database";
import { APIFunction, eventPipe } from "../../util/serverless";
import modifyProfile from "./service";

export const profileModify: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, connectTypeOrm, checkAccessToken, modifyProfile);
