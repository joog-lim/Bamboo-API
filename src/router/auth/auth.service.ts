import { APIGatewayEvent } from "aws-lambda";
import { getRepository } from "typeorm";
import jwt, { JwtPayload } from "jsonwebtoken";

import { QuestionDTO } from "../../DTO/question.dto";
import { Question } from "../../entity";
import { createErrorRes, createRes, ERROR_CODE } from "../../util/http";
import { User } from "../../entity";
import { getIdentity } from "../../util/verify";
import { IdentityType } from "../../DTO/user.dto";

export const AuthService: { [k: string]: Function } = {
  addVerifyQuestion: async ({ question, answer }: QuestionDTO) => {
    if (!question || !answer) {
      return createErrorRes({ status: 400, errorCode: ERROR_CODE.JL003 });
    }
    try {
      await getRepository(Question).insert({ question, answer });
      return createRes({ statusCode: 201 });
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: ERROR_CODE.JL004 });
    }
  },
  getVerifyQuestion: async () => {
    const repo = getRepository(Question);

    const count = await repo.count();
    const random: number = ~~(Math.random() * count);
    try {
      return createRes({
        body: (
          await repo.find({ select: ["id", "question"], skip: random, take: 1 })
        )[0],
      });
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: ERROR_CODE.JL004 });
    }
  },
  login: async (event: APIGatewayEvent) => {
    const token: string = JSON.parse(event.body).token;

    if (!token) {
      return createErrorRes({
        errorCode: ERROR_CODE.JL005,
        status: 400,
      });
    }
    const decode = jwt.decode(token) as JwtPayload;
    const { email } = decode;
    const identity: IdentityType = getIdentity(email);

    const repo = getRepository(User);
    const getUserSubId = await repo.find({
      select: ["subId"],
      where: { subId: decode.sub },
    });

    try {
      if (getUserSubId.length === 0) {
        // Not found User
        await getRepository(User).insert({
          subId: decode.sub,
          email: decode.email,
          nickname: decode.name,
          identity,
        });
      } else {
        await getRepository(User).update(
          {
            email: decode.email,
          },
          {
            nickname: decode.name,
            identity,
          }
        );
      }
    } catch (e) {
      console.error(e);
      return createErrorRes({ errorCode: ERROR_CODE.JL004, status: 500 });
    }

    const accessToken = jwt.sign(
      {
        nickname: decode.name,
        sub: decode.sub,
        email: decode.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        issuer: "joog-lim.info",
      }
    );
    const refreshToken = jwt.sign({}, process.env.JWT_SECRET, {
      expiresIn: "30d",
      issuer: "joog-lim.info",
    });

    return createRes({
      body: {
        accessToken,
        refreshToken,
      },
    });
  },
};
