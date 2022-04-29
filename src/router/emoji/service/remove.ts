import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AccessTokenDTO } from "../../../DTO/token.dto";
import { HttpException } from "../../../exception";
import { EmojiRepository } from "../../../repository";
import { createRes } from "../../../util/http";
import { getAuthorizationByHeader, getBody } from "../../../util/req";
import { verifyToken } from "../../../util/token";

const removeLeaf = async (event: APIGatewayEventIncludeConnectionName) => {
  const token = getAuthorizationByHeader(event.headers);
  const connectionName = event.connectionName;
  const { subId } = verifyToken(token) as AccessTokenDTO;
  const { number } = getBody<{ number: number }>(event.body);

  const emojiRepo = getCustomRepository(EmojiRepository, connectionName);

  if (!number) {
    throw new HttpException("JL007");
  }
  const result = await emojiRepo.removeLeaf(
    await emojiRepo.getIdx(subId, number),
  );

  return createRes({ data: result });
};

export default removeLeaf;
