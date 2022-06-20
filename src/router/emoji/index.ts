import { checkAlgorithm } from "../../middleware/algorithm";
import { checkAccessToken, onlyOrigin } from "../../middleware/auth";
import { connectTypeOrm } from "../../middleware/database";
import { APIFunction, eventPipe } from "../../util/serverless";

import { addLeaf, removeLeaf } from "./service";

export const leafAdd: APIFunction = (event) =>
  eventPipe(
    event,
    onlyOrigin,
    connectTypeOrm,
    checkAccessToken,
    checkAlgorithm("body"),
    addLeaf,
  );

export const leafRemove: APIFunction = (event) =>
  eventPipe(
    event,
    onlyOrigin,
    connectTypeOrm,
    checkAccessToken,
    checkAlgorithm("body"),
    removeLeaf,
  );
