import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { SignUpDataDTO } from "../../../DTO/user.dto";
import { User } from "../../../entity";
import { HttpException } from "../../../exception";
import { UserRepository } from "../../../repository";
import { UnauthUserRepository } from "../../../repository/unauthuser";
import { checkArgument, createRes } from "../../../util/http";
import { getBody } from "../../../util/req";
import { generateToken } from "../../../util/token";
import {
  getGeneration,
  hash,
  testIsGSMStudentEmail,
} from "../../../util/verify";

const signUp = async (event: APIGatewayEventIncludeConnectionName) => {
  const data = {
    ...{
      email: "",
      nickname: "",
      stdGrade: 0,
      stdClass: 0,
      stdNumber: 0,
      pw: "",
    },
    ...getBody<SignUpDataDTO>(event.body),
  };

  if (!checkArgument(...Object.values(data))) {
    throw new HttpException("JL003");
  }

  const unauthUserRepo = getCustomRepository(
    UnauthUserRepository,
    event.connectionName,
  );
  const unauthUser = await unauthUserRepo.getUnauthUserByEmail(data.email);

  if (!unauthUser || !unauthUser.verified) {
    throw new HttpException("JL018");
  } // not found user or mail is not verifyed

  const generation = testIsGSMStudentEmail(data.email)
    ? getGeneration(data.email)
    : 0;

  data.pw = hash(data.pw);

  const userRepo = getCustomRepository(UserRepository, event.connectionName);
  const user = (
    await userRepo.insert({
      ...data,
      generation,
    })
  ).identifiers[0] as User;

  await unauthUserRepo.delete(unauthUser.subId);
  const accessToken = generateToken("AccessToken", user);
  const refreshToken = generateToken("RefreshToken", { email: user.email });

  return createRes({
    data: {
      accessToken,
      refreshToken,
      isAdmin: user.isAdmin,
    },
  });
};

export default signUp;
