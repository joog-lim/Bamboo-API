import { getCustomRepository, getRepository } from "typeorm";

import { QuestionDTO } from "../../DTO/question.dto";
import { Question } from "../../entity";
import { createErrorRes, createRes } from "../../util/http";
import { User } from "../../entity";
import { authGoogleToken, getIdentity } from "../../util/verify";
import {
  BaseTokenDTO,
  IdentityType,
  RefreshTokenDTO,
} from "../../DTO/user.dto";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenTypeList,
  verifyToken,
} from "../../util/token";
import { TIME_A_WEEK } from "../../config";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";
import { UserRepository } from "../../repository/user";

export const AuthService: { [k: string]: Function } = {
  addVerifyQuestion: async (
    { question, answer }: QuestionDTO,
    connectionName: string,
  ) => {
    if (!question || !answer) {
      return createErrorRes({ status: 400, errorCode: "JL003" });
    }
    try {
      await getRepository(Question, connectionName).insert({
        question,
        answer,
      });
      return createRes({});
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: "JL004" });
    }
  },

  getVerifyQuestion: async (connectionName: string) => {
    const repo = getRepository(Question, connectionName);

    const count = await repo.count();
    const random: number = ~~(Math.random() * count);
    try {
      return createRes({
        data: (
          await repo.find({ select: ["id", "question"], skip: random, take: 1 })
        )[0],
      });
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: "JL004" });
    }
  },

  getTokenByRefreshToken: async (
    refreshToken: string,
    connectionName: string,
  ) => {
    const data = verifyToken(refreshToken) as BaseTokenDTO;

    if (data.tokenType != TokenTypeList.refreshToken) {
      return createErrorRes({ errorCode: "JL009", status: 401 });
    }

    const repo = getRepository(User, connectionName);

    const { email, isAdmin, nickname, identity } = (
      await repo.find({ email: (data as RefreshTokenDTO).email })
    )[0];

    const accessToken: string = generateAccessToken({
      email,
      isAdmin,
      nickname,
      identity,
    });

    if (~~(new Date().getTime() / 1000) > data.exp - TIME_A_WEEK) {
      refreshToken = generateRefreshToken(data.email);
    }

    return createRes({ data: { accessToken, refreshToken, isAdmin } });
  },

  login: async (event: APIGatewayEventIncludeDBName) => {
    const token: string =
      event.headers.Authorization ?? event.headers.authorization;

    if (!token) {
      return createErrorRes({
        errorCode: "JL005",
      });
    }
    let decoded;
    try {
      decoded = await authGoogleToken(token);
    } catch (e) {
      console.error(e);
      return createErrorRes({ errorCode: "JL006" });
    }
    const { email, sub, name } = decoded;
    const identity: IdentityType = getIdentity(email);

    const userInformation = { nickname: name, identity };

    const repo = getCustomRepository(UserRepository, event.connectionName);
    const userSubId = await repo.checkUserBySub(sub);

    try {
      await (!userSubId
        ? repo.insert(
            Object.assign({}, userInformation, {
              subId: sub,
              email,
            }),
          )
        : repo.update(
            {
              email,
            },
            userInformation,
          ));
    } catch (e) {
      console.error(e);
      return createErrorRes({ errorCode: "JL004", status: 500 });
    }

    const { isAdmin } = await repo.getUserByEmail(email);
    const accessToken = generateAccessToken(
      Object.assign({}, userInformation, {
        email,
        isAdmin,
      }),
    );

    const refreshToken = generateRefreshToken(email);

    return createRes({
      data: {
        accessToken,
        refreshToken,
        isAdmin,
      },
    });
  },
};
