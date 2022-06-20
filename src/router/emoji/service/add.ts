import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AccessTokenDTO } from "../../../DTO/token.dto";
import { HttpException } from "../../../exception";
import { EmojiRepository } from "../../../repository";
import { createRes } from "../../../util/http";
import { getAuthorizationByHeader, getBody } from "../../../util/req";
import { verifyToken } from "../../../util/token";

const addLeaf = async (event: APIGatewayEventIncludeConnectionName) => {
  const token = getAuthorizationByHeader(event.headers);
  const connectionName = event.connectionName;
  const { subId } = verifyToken(token) as AccessTokenDTO;
  const { number } = getBody<{ number: number }>(event.body);

  const emojiRepo = getCustomRepository(EmojiRepository, connectionName);

  if (!number) {
    throw new HttpException("JL007");
  }

  const preResult = (
    await emojiRepo.find({
      where: { user: subId, algorithm: number },
    })
  )[0];

  if (!!preResult) {
    throw new HttpException("JL015");
  }

  const result = await emojiRepo.addLeaf(subId, number);

  return createRes({ data: result });
};
export default addLeaf;
