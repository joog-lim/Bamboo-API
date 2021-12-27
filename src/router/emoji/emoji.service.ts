import { APIGatewayEvent } from "aws-lambda";
import { getCustomRepository } from "typeorm";

import { AccessTokenDTO } from "../../DTO/user.dto";
import { AlgorithmRepository } from "../../repository/algorithm";
import { EmojiRepository } from "../../repository/emoji";
import { UserRepository } from "../../repository/user";
import { createErrorRes, createRes } from "../../util/http";
import { verifyToken } from "../../util/token";

export const EmojiService: { [k: string]: Function } = {
  addLeaf: async (event: APIGatewayEvent) => {
    const token = event.headers.Authorization || event.headers.authorization;
    const { email } = verifyToken(token) as AccessTokenDTO;
    const { number } = JSON.parse(event.body);

    const emojiRepo = getCustomRepository(EmojiRepository);
    const algorithmRepo = getCustomRepository(AlgorithmRepository);
    const userRepo = getCustomRepository(UserRepository);

    const subId = await userRepo.getSubByEmail(email);
    const algorithmNumber = await algorithmRepo.getIdxByNumber(number);

    if (!subId || !algorithmNumber) {
      return createErrorRes({ errorCode: "JL007" });
    }

    const result = await emojiRepo.addLeaf(subId, algorithmNumber);

    return createRes({ body: result });
  },
  removeLeaf: async (event: APIGatewayEvent) => {
    const token = event.headers.Authorization || event.headers.authorization;
    const { email } = verifyToken(token) as AccessTokenDTO;
    const { number } = JSON.parse(event.body);

    const emojiRepo = getCustomRepository(EmojiRepository);
    const algorithmRepo = getCustomRepository(AlgorithmRepository);
    const userRepo = getCustomRepository(UserRepository);

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
