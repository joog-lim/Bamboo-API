import { getCustomRepository, getRepository } from "typeorm";
import { verifyIdToken, AppleIdTokenType } from "apple-signin-auth";

import { Question } from "../../entity";
import { TIME_A_WEEK } from "../../config";
import { HttpException } from "../../exception";

import { QuestionDTO } from "../../DTO/question.dto";
import { IdentityType, RefreshTokenDTO } from "../../DTO/user.dto";
import { APIGatewayEventIncludeDBName } from "../../DTO/http.dto";

import { UserRepository } from "../../repository";

import {
  generateAccessToken,
  generateRefreshToken,
  TokenTypeList,
  verifyToken,
} from "../../util/token";
import { sendAuthMessage } from "../../util/mail";
import { nowTimeisLeesthanUnauthUserExpiredAt } from "../../util/user";
import { getAuthorizationByHeader } from "../../util/req";
import { createRes } from "../../util/http";
import { authGoogleToken, getIdentity } from "../../util/verify";

export const AuthService: { [k: string]: Function } = {
  addVerifyQuestion: async (
    { question, answer }: QuestionDTO,
    connectionName: string,
  ) => {
    if (!question || !answer) {
      throw new HttpException("JL003");
    }
    try {
      await getRepository(Question, connectionName).insert({
        question,
        answer,
      });
      return createRes({});
    } catch (e: unknown) {
      console.error(e);
      throw new HttpException("JL004");
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
      throw new HttpException("JL004");
    }
  },

  getTokenByRefreshToken: async (
    refreshToken: string,
    connectionName: string,
  ) => {
    const data = verifyToken(refreshToken) as RefreshTokenDTO;

    if (data.tokenType != TokenTypeList.refreshToken) {
      throw new HttpException("JL009");
    }

    const repo = getCustomRepository(UserRepository, connectionName);

    const user = await repo.getUserByEmail(data.email);

    if (user == undefined) {
      throw new HttpException("JL006");
    }
    const accessToken: string = generateAccessToken(user);

    if (~~(new Date().getTime() / 1000) > (data.exp || 0) - TIME_A_WEEK) {
      refreshToken = generateRefreshToken(data.email);
    }

    return createRes({
      data: { accessToken, refreshToken, isAdmin: user.isAdmin },
    });
  },

  login: async (event: APIGatewayEventIncludeDBName) => {
    const token: string = getAuthorizationByHeader(event.headers);

    if (!token) {
      throw new HttpException("JL005");
    }
    let decoded;
    try {
      decoded = await authGoogleToken(token);
    } catch (e) {
      console.error(e);
      throw new HttpException("JL006");
    }
    const { email, sub, name } = decoded;
    const identity: IdentityType = getIdentity(email);

    const userInformation = {
      nickname: (name as string).replace(/[^가-힣]/gi, ""),
      identity,
    };

    const repo = getCustomRepository(UserRepository, event.connectionName);
    const userSubId = await repo.checkUserBySub(sub);

    try {
      await (!userSubId
        ? repo.insert({ ...userInformation, subId: sub, email })
        : repo.update(
            {
              email,
            },
            userInformation,
          ));
    } catch (e) {
      console.error(e);
      throw new HttpException("JL004");
    }

    const user = await repo.getUserByEmail(email);

    if (user === undefined) {
      throw new HttpException("JL006");
    }

    const accessToken = generateAccessToken({
      ...userInformation,
      ...user,
    });

    const refreshToken = generateRefreshToken(email);

    return createRes({
      data: {
        accessToken,
        refreshToken,
        isAdmin: user.isAdmin,
      },
    });
  },
};
