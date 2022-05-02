import {
  AlgorithmRouter,
  EmojiRouter,
  AuthRouter,
  CommentRouter,
  ProfileRouter,
} from "./router";

export const getAlgorithmCountAtAll: Function =
  AlgorithmRouter.getAlgorithmCountAtAll;
export const getAlgorithmRules: Function = AlgorithmRouter.getAlgorithmRules;
export const getAlgorithmRulesForWeb: Function =
  AlgorithmRouter.getAlgorithmRulesForWeb;
export const getAlgorithmByUser: Function = AlgorithmRouter.getAlgorithmByUser;
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
export const login: Function = AuthRouter.login;
export const signUp: Function = AuthRouter.signUp;
export const mailSend: Function = AuthRouter.mailSend;
export const mailAuth: Function = AuthRouter.mailAuth;

export const addLeaf: Function = EmojiRouter.addLeaf;
export const removeLeaf: Function = EmojiRouter.removeLeaf;

export const addComment: Function = CommentRouter.addComment;
export const deleteComment: Function = CommentRouter.deleteComment;

export const modifyProfile: Function = ProfileRouter.modifyProfile;
