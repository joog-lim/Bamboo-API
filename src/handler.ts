import { AlgorithmRouter, EmojiRouter, AuthRouter } from "./router";

export const getAlgorithmCountAtAll: Function =
  AlgorithmRouter.getAlgorithmCountAtAll;
export const getAlgorithmRules: Function = AlgorithmRouter.getAlgorithmRules;
export const getAlgorithmRulesForWeb: Function =
  AlgorithmRouter.getAlgorithmRulesForWeb;
export const getAlgorithmListByUser: Function =
  AlgorithmRouter.getAlgorithmListByUser;
export const getAlgorithmListByAdmin: Function =
  AlgorithmRouter.getAlgorithmListByAdmin;
export const wirteAlgorithm: Function = AlgorithmRouter.wirteAlgorithm;
export const setAlgorithmStatus: Function = AlgorithmRouter.setAlgorithmStatus;
export const modifyAlogirithemContent: Function =
  AlgorithmRouter.modifyAlgorithmContent;
export const deleteAlgorithm: Function = AlgorithmRouter.deleteAlgorithm;
export const getVerifyQuestion: Function = AuthRouter.getVerifyQuestion;
export const addVerifyQuestion: Function = AuthRouter.addVerifyQuestion;
export const getTokenByRefreshToken: Function =
  AuthRouter.getTokenByRefreshToken;
export const appleLogin: Function = AuthRouter.appleLogin;
export const authAuthenticationNumber: Function =
  AuthRouter.authAuthenticationNumber;
export const login: Function = AuthRouter.login;
export const sendEmail: Function = AuthRouter.sendEmail;
export const logOut: Function = AuthRouter.logOut;
export const addLeaf: Function = EmojiRouter.addLeaf;
export const removeLeaf: Function = EmojiRouter.removeLeaf;
