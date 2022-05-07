import { checkAlgorithm } from "../../middleware/algorithm";
import {
  authUserByVerifyQuestionOrToken,
  onlyAdmin,
  onlyOrigin,
} from "../../middleware/auth";
import { connectTypeOrm } from "../../middleware/database";
import { APIFunction, eventPipe } from "../../util/serverless";
import {
  deleteAlgorithm,
  getAlgorithmByIdx,
  getAlgorithmCountAtAll,
  getAlgorithmLists,
  getAlgorithmRules,
  getAlgorithmRulesForWeb,
  modifyAlgorithmContent,
  setAlgorithmStatus,
  writeAlgorithm,
} from "./service";

export const getAlgorithmByUser: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, connectTypeOrm, getAlgorithmByIdx("user"));

export const getAlgorithmListByUser: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, connectTypeOrm, getAlgorithmLists("user"));

export const getAlgorithmListByAdmin: APIFunction = (event) =>
  eventPipe(
    event,
    onlyOrigin,
    connectTypeOrm,
    onlyAdmin,
    getAlgorithmLists("admin"),
  );

export const getAlgorithmCountAll: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, connectTypeOrm, getAlgorithmCountAtAll);

export const getAlgorithmRule: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, getAlgorithmRules);

export const getAlgorithmRuleForWeb: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, getAlgorithmRulesForWeb);

export const insertAlgorithm: APIFunction = (event) =>
  eventPipe(
    event,
    onlyOrigin,
    connectTypeOrm,
    authUserByVerifyQuestionOrToken,
    writeAlgorithm,
  );

export const modifyAlgorithmStatus: APIFunction = (event) =>
  eventPipe(
    event,
    onlyOrigin,
    connectTypeOrm,
    checkAlgorithm("param"),
    setAlgorithmStatus,
  );

export const modifyAlgorithmContents: APIFunction = (event) =>
  eventPipe(
    event,
    onlyOrigin,
    connectTypeOrm,
    onlyAdmin,
    checkAlgorithm("param"),
    modifyAlgorithmContent,
  );

export const removeAlgorithm: APIFunction = (event) =>
  eventPipe(
    event,
    onlyOrigin,
    connectTypeOrm,
    onlyAdmin,
    checkAlgorithm("param"),
    deleteAlgorithm,
  );
