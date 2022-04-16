import { UnauthUser } from "../entity/UnauthUser";
import { getKSTNow } from "./date";

export const nowTimeisLeesthanUnauthUserExpiredAt: Function = (
  unauthUser: UnauthUser,
): boolean =>
  getKSTNow().getTime() < (unauthUser.expiredAt || getKSTNow()).getTime();
