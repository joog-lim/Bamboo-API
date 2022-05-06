import {
  getAlgorithmCountAll,
  getAlgorithmRule,
  getAlgorithmRuleForWeb,
  getAlgorithmByUser,
  getAlgorithmListByUser,
  getAlgorithmListByAdmin,
  insertAlgorithm,
  modifyAlgorithmContents,
  modifyAlgorithmStatus,
  removeAlgorithm,
} from "./router/algorithm";

import {
  addVeirfyQuestions,
  getVerifyQuestions,
  login,
  mailAuth,
  mailSend,
  refreshTokens,
  regist,
} from "./router/auth";

import { addComments, removeComment } from "./router/comment";

import { leafAdd, leafRemove } from "./router/emoji";

import { profileModify } from "./router/profile";
export {
  getAlgorithmCountAll as getAlgorithmCountAtAll,
  getAlgorithmRule as getAlgorithmRules,
  getAlgorithmRuleForWeb as getAlgorithmRulesForWeb,
  getAlgorithmByUser,
  getAlgorithmListByUser,
  getAlgorithmListByAdmin,
  insertAlgorithm as writeAlgorithm,
  modifyAlgorithmContents as modifyAlgorithmContent,
  modifyAlgorithmStatus as setAlgorithmStatus,
  removeAlgorithm as deleteAlgorithm,
};

export {
  addVeirfyQuestions as addVerifyQuestion,
  getVerifyQuestions as getVerifyQuestion,
  login,
  mailAuth,
  mailSend,
  refreshTokens as getTokenByRefreshToken,
  regist as signUp,
};

export { addComments as addComment, removeComment as deleteComment };

export { leafAdd as addLeaf, leafRemove as removeLeaf };

export { profileModify as modifyProfile };
