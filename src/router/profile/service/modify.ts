import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AccessTokenDTO } from "../../../DTO/token.dto";
import { StdInformation } from "../../../DTO/user.dto";
import { HttpException } from "../../../exception";
import { UserRepository } from "../../../repository";
import { createRes } from "../../../util/http";
import { getAuthorizationByHeader, getBody } from "../../../util/req";
import { verifyToken } from "../../../util/token";

const modifyProfile = async (event: APIGatewayEventIncludeConnectionName) => {
  const token = getAuthorizationByHeader(event.headers);
  const { subId } = verifyToken(token) as AccessTokenDTO;
  const body = getBody<Partial<StdInformation>>(event.body);

  const userRepo = getCustomRepository(UserRepository, event.connectionName);

  try {
    await userRepo.update(subId, body);

    return createRes({});
  } catch (e) {
    console.error(e);
    throw new HttpException("JL004");
  }
};
export default modifyProfile;
