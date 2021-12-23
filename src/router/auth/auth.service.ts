import { APIGatewayEvent } from "aws-lambda";
import { getRepository } from "typeorm";
import jwt from "jsonwebtoken";

import { QuestionDTO } from "../../DTO/question.dto";
import { Question } from "../../entity";
import { createErrorRes, createRes } from "../../util/http";
import { User } from "../../entity";
import { authGoogleToken, getIdentity } from "../../util/verify";
import { IdentityType } from "../../DTO/user.dto";

export const AuthService: { [k: string]: Function } = {
  addVerifyQuestion: async ({ question, answer }: QuestionDTO) => {
    if (!question || !answer) {
      return createErrorRes({ status: 400, errorCode: "JL003" });
    }
    try {
      await getRepository(Question).insert({ question, answer });
      return createRes({ statusCode: 201 });
    } catch (e: unknown) {
      console.error(e);
      return createErrorRes({ status: 500, errorCode: "JL004" });
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
      return createErrorRes({ status: 500, errorCode: "JL004" });
    }
  },
  login: async (event: APIGatewayEvent) => {
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

    const repo = getRepository(User);
    const getUserSubId = await repo.find({
      select: ["subId"],
      where: { subId: sub },
    });

    try {
      if (getUserSubId.length === 0) {
        // Not found User
        await getRepository(User).insert({
          subId: sub,
          email: email,
          nickname: name,
          identity,
        });
      } else {
        await getRepository(User).update(
          {
            email: email,
          },
          {
            nickname: name,
            identity,
          }
        );
      }
    } catch (e) {
      console.error(e);
      return createErrorRes({ errorCode: "JL004", status: 500 });
    }

    const accessToken = jwt.sign(
      {
        nickname: name,
        sub: sub,
        email,
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
