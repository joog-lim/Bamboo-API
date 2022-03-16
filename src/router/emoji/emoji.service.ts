import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";

import { AccessTokenDTO } from "../../DTO/user.dto";
import { HttpException } from "../../exception";
import { EmojiRepository } from "../../repository/emoji";
import { UserRepository } from "../../repository/user";
import { createErrorRes, createRes } from "../../util/http";
import { verifyToken } from "../../util/token";

export const EmojiService: { [k: string]: Function } = {
  addLeaf: async (event: APIGatewayEventIncludeDBName) => {
    const token = event.headers.Authorization || event.headers.authorization;
    const connectionName = event.connectionName;
    const { email } = verifyToken(token) as AccessTokenDTO;
    const { number } = JSON.parse(event.body);

    const emojiRepo = getCustomRepository(EmojiRepository, connectionName);
    const userRepo = getCustomRepository(UserRepository, connectionName);

    const subId = await userRepo.getSubByEmail(email);

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
    const token = event.headers.Authorization || event.headers.authorization;
    const connectionName = event.connectionName;
    const { email } = verifyToken(token) as AccessTokenDTO;
    const { number } = JSON.parse(event.body);

    const emojiRepo = getCustomRepository(EmojiRepository, connectionName);
    const userRepo = getCustomRepository(UserRepository, connectionName);

    const subId = await userRepo.getSubByEmail(email);

    if (!subId || !number) {
      throw new HttpException("JL007");
    }
    const result = await emojiRepo.removeLeaf(
      await emojiRepo.getIdx(subId, number),
    );

    return createRes({ data: result });
  },
};
