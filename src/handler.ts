import { AlgorithmRouter, EmojiRouter, AuthRouter } from "./router";

export const getAlgorithmCountAtAll: Function =
  AlgorithmRouter.getAlgorithmCountAtAll;
export const getAlgorithmRules: Function = AlgorithmRouter.getAlgorithmRules;
export const getAlgorithmRulesForWeb: Function =
  AlgorithmRouter.getAlgorithmRulesForWeb;
export const getAlgorithmList: Function = AlgorithmRouter.getAlgorithmList;
export const getAlgorithmListAtPages: Function =
  AlgorithmRouter.getAlgorithmListAtPages;
export const wirteAlgorithm: Function = AlgorithmRouter.wirteAlgorithm;
export const setAlgorithmStatus: Function = AlgorithmRouter.setAlgorithmStatus;
export const modifyAlogirithemContent: Function =
  AlgorithmRouter.modifyAlgorithmContent;
export const reportAlgorithm: Function = AlgorithmRouter.reportAlgorithm;
export const deleteAlgorithm: Function = AlgorithmRouter.deleteAlgorithm;
export const getVerifyQuestion: Function = AuthRouter.getVerifyQuestion;
export const addVerifyQuestion: Function = AuthRouter.addVerifyQuestion;
export const login: Function = AuthRouter.login;
export const logOut: Function = AuthRouter.logOut;
export const addLeaf: Function = EmojiRouter.addLeaf;
export const removeLeaf: Function = EmojiRouter.removeLeaf;
