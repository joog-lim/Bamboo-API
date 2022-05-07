import { authAdminPassword, onlyOrigin } from "../../middleware/auth";
import { connectTypeOrm } from "../../middleware/database";
import { APIFunction, eventPipe } from "../../util/serverless";
import {
  signUp,
  signIn,
  sendMail,
  authMail,
  addVerifyQuestion,
  getTokenByRefreshToken,
  getVerifyQuestion,
} from "./service";

export const regist: APIFunction = (event) =>
  eventPipe(event, connectTypeOrm, signUp);

export const login: APIFunction = (event) =>
  eventPipe(event, connectTypeOrm, signIn);

export const mailSend: APIFunction = (event) =>
  eventPipe(event, connectTypeOrm, sendMail);

export const mailAuth: APIFunction = (event) =>
  eventPipe(event, connectTypeOrm, authMail);

export const getVerifyQuestions: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, connectTypeOrm, getVerifyQuestion);

export const addVeirfyQuestions: APIFunction = (event) =>
  eventPipe(event, authAdminPassword, connectTypeOrm, addVerifyQuestion);

export const refreshTokens: APIFunction = (event) =>
  eventPipe(event, onlyOrigin, connectTypeOrm, getTokenByRefreshToken);
