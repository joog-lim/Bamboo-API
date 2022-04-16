import { getCustomRepository } from "typeorm";

import { TIME_A_WEEK } from "../../config";
import { HttpException } from "../../exception";

import { QuestionDTO } from "../../DTO/question.dto";
import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import { TokenTypeList } from "../../DTO/token.dto";

import { QuestionRepository, UserRepository } from "../../repository";

import { verifyToken, generateToken } from "../../util/token";
import { getAuthorizationByHeader } from "../../util/req";
import { createRes } from "../../util/http";
import {
  authGoogleToken,
  getGeneration,
  testIsGSMEmail,
  testIsGSMStudentEmail,
} from "../../util/verify";

export const AuthService: { [k: string]: Function } = {
  addVerifyQuestion: async (
    { question, answer }: QuestionDTO,
    connectionName: string,
  ) => {
    if (!question || !answer) {
      throw new HttpException("JL003");
    }
    try {
      await getCustomRepository(QuestionRepository, connectionName).insert({
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
    try {
      return createRes({
        data: await getCustomRepository(
          QuestionRepository,
          connectionName,
        ).getVerifyQuestion(),
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
    const data = verifyToken(refreshToken);

    if (data?.tokenType !== TokenTypeList.refreshToken) {
      throw new HttpException("JL009");
    }

    const repo = getCustomRepository(UserRepository, connectionName);

    const user = await repo.getUserByEmail(data.email);

    if (user === undefined) {
      throw new HttpException("JL006");
    }

    const accessToken: string = generateToken("AccessToken", user);

    if (~~(new Date().getTime() / 1000) > (data.exp || 0) - TIME_A_WEEK) {
      refreshToken = generateToken("RefreshToken", { email: data.email });
    }

    return createRes({
      data: { accessToken, refreshToken, isAdmin: user.isAdmin },
    });
  },

  login: async (event: APIGatewayEventIncludeConnectionName) => {
    const token: string = getAuthorizationByHeader(event.headers);
    if (!token) {
      throw new HttpException("JL005");
    }

    const decoded = await authGoogleToken(token);
    if (decoded === undefined) {
      throw new HttpException("JL006");
    }

    const { email, sub, name } = decoded;

    const userRepo = getCustomRepository(UserRepository, event.connectionName);
    const user = await userRepo.getUserBySub(sub);

    const userInformation = {
      subId: sub as string,
      email: email as string,
      nickname: (name as string).replace(/[^가-힣]/gi, ""),
      isAdmin: !!user?.isAdmin,
    };

    if (user === undefined) {
      if (testIsGSMEmail(email)) {
        throw new HttpException("JL016");
      }

      await userRepo.insert({
        ...userInformation,
        generation: testIsGSMStudentEmail(email) ? getGeneration(email) : 0,
      });
    }

    const accessToken = generateToken("AccessToken", userInformation);
    const refreshToken = generateToken("RefreshToken", { email });

    return createRes({
      data: {
        accessToken,
        refreshToken,
        isAdmin: userInformation.isAdmin,
      },
    });
  },
};
