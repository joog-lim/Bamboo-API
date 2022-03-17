import { getCustomRepository } from "typeorm";

import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import { AccessTokenDTO } from "../../DTO/user.dto";

import { HttpException } from "../../exception";

import { EmojiRepository } from "../../repository";

import { createRes } from "../../util/http";
import { getAuthorizationByHeader, getBody } from "../../util/req";
import { verifyToken } from "../../util/token";

export const EmojiService: { [k: string]: Function } = {
  addLeaf: async (event: APIGatewayEventIncludeDBName) => {
    const token = getAuthorizationByHeader(event.headers);
    const connectionName = event.connectionName;
    const { subId } = verifyToken(token) as AccessTokenDTO;
    const { number } = getBody<{ number: number }>(event.body);

    const emojiRepo = getCustomRepository(EmojiRepository, connectionName);

    if (!subId || !number) {
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
  },
  removeLeaf: async (event: APIGatewayEventIncludeDBName) => {
    const token = getAuthorizationByHeader(event.headers);
    const connectionName = event.connectionName;
    const { subId } = verifyToken(token) as AccessTokenDTO;
    const { number } = getBody<{ number: number }>(event.body);

    const emojiRepo = getCustomRepository(EmojiRepository, connectionName);

    if (!subId || !number) {
      throw new HttpException("JL007");
    }
    const result = await emojiRepo.removeLeaf(
      await emojiRepo.getIdx(subId, number),
    );

    return createRes({ data: result });
  },
};
