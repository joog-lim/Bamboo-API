import { KR_TIME_DIFF } from "../config";

export const getKSTNow: Function = (): Date => {
  const now = new Date();
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utcNow + KR_TIME_DIFF);
};
