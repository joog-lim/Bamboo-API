import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { SignInDataDTO } from "../../../DTO/user.dto";
import { HttpException } from "../../../exception";
import { UserRepository } from "../../../repository";
import { checkArgument, createRes } from "../../../util/http";
import { getBody } from "../../../util/req";
import { generateToken } from "../../../util/token";
import { hash } from "../../../util/verify";

const login = async (event: APIGatewayEventIncludeConnectionName) => {
  const data = getBody<SignInDataDTO>(event.body);

  if (!checkArgument(Object.values(data))) {
    throw new HttpException("JL003");
  }

  const userRepo = getCustomRepository(UserRepository, event.connectionName);
  const user = await userRepo.getUserByEmail(data.email);

  if (!user) {
    throw new HttpException("JL017");
  }
  if (hash(user.pw) !== hash(user.pw)) {
    throw new HttpException("JL017");
  }

  const { email, isAdmin } = user;

  const accessToken = generateToken("AccessToken", user);
  const refreshToken = generateToken("RefreshToken", { email });

  return createRes({
    data: {
      accessToken,
      refreshToken,
      isAdmin: isAdmin,
    },
  });
};
export default login;
