import { getCustomRepository, getRepository } from "typeorm";
import { verifyIdToken, AppleIdTokenType } from "apple-signin-auth";

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
import { UnauthUserRepository } from "../../repository/unauthuser";
import { sendAuthMessage } from "../../util/mail";
import { nowTimeisLeesthanUnauthUserExpiredAt } from "../../util/user";

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

  authAuthenticationNumber: async (event: APIGatewayEventIncludeDBName) => {
    const subId: string =
      event.headers.Authorization ?? event.headers.authorization;

    const randomNumber = JSON.parse(event.body)?.authenticationNumber;
    const unauthUserRepo = getCustomRepository(
      UnauthUserRepository,
      event.connectionName,
    );

    const unauthUser = await unauthUserRepo.getUnauthUserBySubAndNumber(
      subId,
      randomNumber,
    );
    if (!unauthUser) {
      return createErrorRes({ errorCode: "JL014", status: 404 });
    }

    if (!nowTimeisLeesthanUnauthUserExpiredAt(unauthUser)) {
      return createErrorRes({ errorCode: "JL013" });
    }
    const email = unauthUser.email;
    const userRepo = getCustomRepository(UserRepository, event.connectionName);
    await userRepo.insert({
      subId: unauthUser.subId,
      email,
      nickname: unauthUser.name,
      identity: getIdentity(unauthUser.email),
    });
    await unauthUserRepo.delete({ subId });

    const accessToken = generateAccessToken({
      email,
      nickname: unauthUser.name,
      identity: getIdentity(unauthUser.email),
      isAdmin: false,
    });

    const refreshToken = generateRefreshToken(email);

    return createRes({ data: { accessToken, refreshToken, isAdmin: false } });
  },
  appleLogin: async (event: APIGatewayEventIncludeDBName) => {
    const token: string =
      event.headers.Authorization ?? event.headers.authorization;

    if (!token) {
      return createErrorRes({
        errorCode: "JL005",
      });
    }
    let userData: AppleIdTokenType;
    try {
      userData = await verifyIdToken(token, {
        audience: "com.JiHoonAHN.bamboo-iOS",
        iss: "https://appleid.apple.com",
        ignoreExpiration: false,
      });
    } catch (err) {
      // Token is not verified
      console.error(err);
      return createErrorRes({ errorCode: "JL006" });
    }

    //check duplicate user
    const userRepo = getCustomRepository(UserRepository, event.connectionName);
    const user = await userRepo.checkUserBySub(userData.sub);
    if (user) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user.email);

      return createRes({
        data: { isAuth: true, accessToken, refreshToken, isAdmin: false },
      });
    }

    const { sub } = userData;
    const repo = getCustomRepository(
      UnauthUserRepository,
      event.connectionName,
    );

    const checkDuplicate = await repo.findOne(sub);
    if (checkDuplicate) {
      return createRes({ data: { isAuth: false, sub } });
    }

    //add Unauth User
    const body = JSON.parse(event.body);
    const name = body.name;
    if (!name) {
      return createErrorRes({ errorCode: "JL003" });
    }

    try {
      await repo.insert({ subId: sub, name: name.replace(/[^가-힣]/gi, "") });
    } catch (e: unknown) {
      return createErrorRes({ errorCode: "JL004" });
    }
    return createRes({ data: { isAuth: false, sub } });
  },
  sendAuthEmail: async (event: APIGatewayEventIncludeDBName) => {
    const repo = getCustomRepository(
      UnauthUserRepository,
      event.connectionName,
    );

    const subId: string =
      event.headers.Authorization ?? event.headers.authorization;

    const email = JSON.parse(event.body)?.email;

    try {
      await repo.update({ subId }, { email });
      const randomNumber: string = await repo.setAuthenticationNumber(subId);
      const result = await sendAuthMessage({
        receiver: email,
        authNumber: randomNumber.padStart(4, "0"),
      });

      if (result) {
        return createRes({});
      }
    } catch (e: unknown) {
      return createErrorRes({ errorCode: "JL004" });
    }
    return createErrorRes({ errorCode: "JL004" });
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

    const userInformation = {
      nickname: (name as string).replace(/[^가-힣]/gi, ""),
      identity,
    };

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
