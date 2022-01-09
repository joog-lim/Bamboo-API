import { APIGatewayEvent } from "aws-lambda";
import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";

import { AccessTokenDTO } from "../../DTO/user.dto";
import { AlgorithmRepository } from "../../repository/algorithm";
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
    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      connectionName
    );
    const userRepo = getCustomRepository(UserRepository, connectionName);

    const subId = await userRepo.getSubByEmail(email);
    const algorithmNumber = await algorithmRepo.getIdxByNumber(number);

    if (!subId || !algorithmNumber) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const result = await emojiRepo.addLeaf(subId, algorithmNumber);

    return createRes({ body: result });
  },
  removeLeaf: async (event: APIGatewayEventIncludeDBName) => {
    const token = event.headers.Authorization || event.headers.authorization;
    const connectionName = event.connectionName;
    const { email } = verifyToken(token) as AccessTokenDTO;
    const { number } = JSON.parse(event.body);

    const emojiRepo = getCustomRepository(EmojiRepository, connectionName);
    const algorithmRepo = getCustomRepository(
      AlgorithmRepository,
      connectionName
    );
    const userRepo = getCustomRepository(UserRepository, connectionName);

    const subId = await userRepo.getSubByEmail(email);
    const algorithmNumber = await algorithmRepo.getIdxByNumber(number);

    if (!subId || !algorithmNumber) {
      return createErrorRes({ errorCode: "JL007" });
    }
    const result = await emojiRepo.removeLeaf(
      await emojiRepo.getIdx(subId, algorithmNumber)
    );

    return createRes({ body: result });
  },
};
