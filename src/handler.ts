import { AlgorithemRouter, EmojiRouter, AuthRouter } from "./router";

export const getAlgorithemCountAtAll: Function =
  AlgorithemRouter.getAlgorithemCountAtAll;
export const getAlgorithemRules: Function = AlgorithemRouter.getAlgorithemRules;
export const getAlgorithemRulesForWeb: Function =
  AlgorithemRouter.getAlgorithemRulesForWeb;
export const getAlgorithemList: Function = AlgorithemRouter.getAlgorithemList;
export const getAlgorithemListAtPages: Function =
  AlgorithemRouter.getAlgorithemListAtPages;
export const wirteAlogorithem: Function = AlgorithemRouter.wirteAlogorithem;
export const setAlogorithemStatus: Function =
  AlgorithemRouter.setAlogorithemStatus;
export const modifyAlogirithemContent: Function =
  AlgorithemRouter.modifyAlogirithemContent;
export const reportAlogorithem: Function = AlgorithemRouter.reportAlogorithem;
export const deleteAlgorithem: Function = AlgorithemRouter.deleteAlgorithem;
export const getVerifyQuestion: Function = AuthRouter.getVerifyQuestion;
export const addVerifyQuestion: Function = AuthRouter.addVerifyQuestion;
export const login: Function = AuthRouter.login;
export const logOut: Function = AuthRouter.logOut;
export const addLeaf: Function = EmojiRouter.addLeaf;
export const removeLeaf: Function = EmojiRouter.removeLeaf;
