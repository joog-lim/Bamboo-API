import { getCustomRepository } from "typeorm";
import { TIME_A_WEEK } from "../../../config";
import { TokenTypeList } from "../../../DTO/token.dto";
import { HttpException } from "../../../exception";
import { UserRepository } from "../../../repository";
import { createRes } from "../../../util/http";
import { generateToken, verifyToken } from "../../../util/token";

const getTokenByRefreshToken = async (
  refreshToken: string,
  connectionName: string,
) => {
  const data = verifyToken(refreshToken);

  if (data?.tokenType !== TokenTypeList.refreshToken) {
    throw new HttpException("JL009");
  }

  const repo = getCustomRepository(UserRepository, connectionName);

  const user = await repo.getUserByEmail(data.email);

  if (user === undefined) {
    throw new HttpException("JL006");
  }

  const accessToken: string = generateToken("AccessToken", user);

  if (~~(new Date().getTime() / 1000) > (data.exp || 0) - TIME_A_WEEK) {
    refreshToken = generateToken("RefreshToken", { email: data.email });
  }

  return createRes({
    data: { accessToken, refreshToken, isAdmin: user.isAdmin },
  });
};

export default getTokenByRefreshToken;
