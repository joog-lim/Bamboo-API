import { getCustomRepository } from "typeorm";
import { SetStatusAlgorithmDTO } from "../../../DTO/algorithm.dto";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AccessTokenDTO } from "../../../DTO/token.dto";
import { HttpException } from "../../../exception";
import {
  AlgorithmRepository,
  ReportAlgorithmRepository,
} from "../../../repository";
import { sendAlgorithmMessageOfStatus } from "../../../util/discord";
import { createRes } from "../../../util/http";
import { isNumeric } from "../../../util/number";
import { getAuthorizationByHeader, getBody } from "../../../util/req";
import { verifyToken } from "../../../util/token";

const setAlgorithmStatus = async (
  event: APIGatewayEventIncludeConnectionName,
) => {
  const id = event.pathParameters?.idx;

  if (!isNumeric(id)) {
    throw new HttpException("JL007");
  }

  const numericId = Number(id);

  const userData = verifyToken(
    getAuthorizationByHeader(event.headers),
  ) as AccessTokenDTO;

  const algorithmRepo = getCustomRepository(
    AlgorithmRepository,
    event.connectionName,
  );

  const reqBody = getBody<SetStatusAlgorithmDTO>(event.body);

  const changeStatus = reqBody.status;
  if (!changeStatus || changeStatus === "PENDING") {
    throw new HttpException("JL010");
  }

  const reason = reqBody?.reason || "";

  if (changeStatus === "REPORTED") {
    await algorithmRepo.setAlgorithmStatus(numericId, reason, "REPORTED");
    !!userData.subId &&
      (await getCustomRepository(
        ReportAlgorithmRepository,
        event.connectionName,
      ).report(userData.subId, numericId));
  }

  if (!userData?.isAdmin && changeStatus !== "REPORTED") {
    throw new HttpException("JL010");
  }

  userData?.isAdmin &&
    (await algorithmRepo.setAlgorithmStatus(numericId, reason, changeStatus));

  const algorithm = await algorithmRepo.getBaseAlgorithmByIdx(numericId);

  await sendAlgorithmMessageOfStatus[changeStatus](algorithm);
  return createRes({ data: algorithm });
};

export default setAlgorithmStatus;
