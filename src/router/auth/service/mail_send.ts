import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AuthEmailArgDTO } from "../../../DTO/user.dto";
import { HttpException } from "../../../exception";
import { UserRepository } from "../../../repository";
import { UnauthUserRepository } from "../../../repository/unauthuser";
import { createRes } from "../../../util/http";
import { sendAuthMessage } from "../../../util/mail";
import { getBody } from "../../../util/req";

const mailSend = async (event: APIGatewayEventIncludeConnectionName) => {
  const email = getBody<Omit<AuthEmailArgDTO, "number">>(event.body).email;

  if (!email) {
    throw new HttpException("JL003");
  }
  const unauthUserRepo = getCustomRepository(
    UnauthUserRepository,
    event.connectionName,
  );
  const userRepo = getCustomRepository(UserRepository, event.connectionName);
  if (!!(await userRepo.getUserByEmail(email))) {
    throw new HttpException("JL019");
  } // email is duplicate

  const _unauthUser = await unauthUserRepo.getUnauthUserByEmail(email);
  if (!_unauthUser) {
    await unauthUserRepo.insert({ email });
  } // don't have account

  const unauthUser = await unauthUserRepo.getUnauthUserByEmail(email);

  await sendAuthMessage({
    receiver: email,
    authNumber: await unauthUserRepo.setAuthenticationNumber(unauthUser.subId),
  });
  return createRes({});
};
export default mailSend;
