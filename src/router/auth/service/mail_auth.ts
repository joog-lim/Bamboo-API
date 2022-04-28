import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AuthEmailArgDTO } from "../../../DTO/user.dto";
import { HttpException } from "../../../exception";
import { UnauthUserRepository } from "../../../repository/unauthuser";
import { createRes } from "../../../util/http";
import { getBody } from "../../../util/req";

const mailAuth = async (event: APIGatewayEventIncludeConnectionName) => {
  const data = getBody<AuthEmailArgDTO>(event.body);

  const unauthUserRepo = getCustomRepository(
    UnauthUserRepository,
    event.connectionName,
  );
  const result = await unauthUserRepo.checkAuthenticationNumber(
    data.email,
    data.number,
  );
  if (!result) {
    throw new HttpException("JL011");
  }
  const unauthUser = await unauthUserRepo.getUnauthUserByEmail(data.email);
  await unauthUserRepo.updateVerified(unauthUser.subId, result);
  return createRes({});
};

export default mailAuth;
