import { getCustomRepository } from "typeorm";

import { TIME_A_WEEK } from "../../config";
import { HttpException } from "../../exception";

import { QuestionDTO } from "../../DTO/question.dto";
import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import { TokenTypeList } from "../../DTO/token.dto";

import { QuestionRepository, UserRepository } from "../../repository";

import { verifyToken, generateToken } from "../../util/token";
import { getBody } from "../../util/req";
import { checkArgument, createRes } from "../../util/http";
import { getGeneration, hash, testIsGSMStudentEmail } from "../../util/verify";
import {
  AuthEmailArgDTO,
  SignInDataDTO,
  SignUpDataDTO,
} from "../../DTO/user.dto";
import { User } from "../../entity";
import { sendAuthMessage } from "../../util/mail";
import { UnauthUserRepository } from "../../repository/unauthuser";

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
    const data = getBody<SignInDataDTO>(event.body);

    if (!checkArgument(Object.values(data))) {
      throw new HttpException("JL003");
    }

    const userRepo = getCustomRepository(UserRepository, event.connectionName);
    const user = await userRepo.getUserByEmail(data.email);

    if (!user) {
      throw new HttpException("JL017");
    }
    if (user.pw !== hash(user.pw)) {
      throw new HttpException("JL017");
    }

    const { email, isAdmin } = user;

    const accessToken = generateToken("AccessToken", user);
    const refreshToken = generateToken("RefreshToken", { email });

    return createRes({
      data: {
        accessToken,
        refreshToken,
        isAdmin: isAdmin,
      },
    });
  },

  mailSend: async (event: APIGatewayEventIncludeConnectionName) => {
    const email = getBody<Omit<AuthEmailArgDTO, "number">>(event.body).email;

    if (!email) {
      throw new HttpException("JL003");
    }
    const unauthUserRepo = getCustomRepository(
      UnauthUserRepository,
      event.connectionName,
    );
    const userRepo = getCustomRepository(UserRepository, event.connectionName);
    if (!!(await userRepo.getUserByEmail(email))) {
      throw new HttpException("JL019");
    } // email is duplicate

    const _unauthUser = await unauthUserRepo.getUnauthUserByEmail(email);
    if (!_unauthUser) {
      await unauthUserRepo.insert({ email });
    } // don't hvae account

    const unauthUser = await unauthUserRepo.getUnauthUserByEmail(email);

    await sendAuthMessage({
      receiver: email,
      authNumber: await unauthUserRepo.setAuthenticationNumber(
        unauthUser.subId,
      ),
    });
    return createRes({});
  },
  mailAuth: async (event: APIGatewayEventIncludeConnectionName) => {
    const data = getBody<AuthEmailArgDTO>(event.body);

    const unauthUserRepo = getCustomRepository(
      UnauthUserRepository,
      event.connectionName,
    );
    const result = await unauthUserRepo.checkAuthenticationNumber(
      data.email,
      data.number,
    );
    if (!result) {
      throw new HttpException("JL011");
    }
    const unauthUser = await unauthUserRepo.getUnauthUserByEmail(data.email);
    await unauthUserRepo.updateVerified(unauthUser.subId, result);
    return createRes({});
  },
  signUp: async (event: APIGatewayEventIncludeConnectionName) => {
    const data = {
      ...{
        email: "",
        nickname: "",
        stdGrade: 0,
        stdClass: 0,
        stdNumber: 0,
        pw: "",
      },
      ...getBody<SignUpDataDTO>(event.body),
    };

    if (!checkArgument(...Object.values(data))) {
      throw new HttpException("JL003");
    }

    const unauthUserRepo = getCustomRepository(
      UnauthUserRepository,
      event.connectionName,
    );
    const unauthUser = await unauthUserRepo.getUnauthUserByEmail(data.email);

    if (!unauthUser || !unauthUser.verified) {
      throw new HttpException("JL018");
    } // not found user or mail is not verifyed

    const generation = testIsGSMStudentEmail(data.email)
      ? getGeneration(data.email)
      : 0;

    data.pw = hash(data.pw);

    const userRepo = getCustomRepository(UserRepository, event.connectionName);
    const user = (
      await userRepo.insert({
        ...data,
        generation,
      })
    ).identifiers[0] as User;

    await unauthUserRepo.delete(unauthUser.subId);
    const accessToken = generateToken("AccessToken", user);
    const refreshToken = generateToken("RefreshToken", { email: user.email });

    return createRes({
      data: {
        accessToken,
        refreshToken,
        isAdmin: user.isAdmin,
      },
    });
  },
};
