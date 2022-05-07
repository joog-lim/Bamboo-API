import { checkAccessToken, onlyOrigin } from "../../middleware/auth";
import { connectTypeOrm } from "../../middleware/database";
import { APIFunction, eventPipe } from "../../util/serverless";
import { addComment, deleteComment } from "./service";

export const addComments: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, connectTypeOrm, checkAccessToken, addComment);

export const removeComment: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, connectTypeOrm, checkAccessToken, deleteComment);
