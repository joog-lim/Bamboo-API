import "reflect-metadata";

import { APIGatewayProxyEvent } from "aws-lambda";

import { baseRequest as dummy } from "./dummy.data";
import { VERIFY_ID, VERIFY_ANSWER } from "./config";
import { wirteAlgorithm } from "../src/handler";

const baseRequest: APIGatewayProxyEvent = {
  ...dummy,
  httpMethod: "POST",
};

describe("write algorithm", () => {
  const writeReq = {
    ...baseRequest,
  };
  const body = {
    title: "타이틀입니다.",
    content: "내용입니다.",
    tag: "테코",
    verify: {
      id: VERIFY_ID,
      answer: VERIFY_ANSWER,
    },
  };

  test("it will be success", async () => {
    const writeAlgorithmReq = {
      ...writeReq,
      ...{
        body: JSON.stringify(body),
      },
    };
    const data = await wirteAlgorithm(writeAlgorithmReq);

    expect(JSON.parse(data.body)).toEqual(
      expect.objectContaining({
        code: "JL000",
      }),
    );
  });

  test("code will be JL003(missing tag)", async () => {
    const body = {
      title: "asfd",
      content: "Afd",
    };

    const writeAlgorithmReq = {
      ...writeReq,
      ...{
        body: JSON.stringify(body),
      },
    };

    const data = await wirteAlgorithm(writeAlgorithmReq);

    expect(JSON.parse(data.body)).toEqual(
      expect.objectContaining({
        errorCode: "JL003",
      }),
    );
  });

  test("code will be JL003(missing verify id)", async () => {
    const body = {
      title: "asfd",
      content: "Afd",
      tag: "태그",
      verify: {
        answer: "그러게요",
      },
    };

    const writeAlgorithmReq = {
      ...writeReq,
      ...{
        body: JSON.stringify(body),
      },
    };

    const data = await wirteAlgorithm(writeAlgorithmReq);
    console.log(writeAlgorithmReq.body);
    expect(JSON.parse(data.body)).toEqual(
      expect.objectContaining({
        errorCode: "JL003",
      }),
    );
  });

  test("code will be JL011(missing ", async () => {
    const writeAlgorithmReq = {
      ...writeReq,
      ...{
        body: JSON.stringify({
          ...body,
          ...{ verify: { id: VERIFY_ID, answer: "그러게요" } },
        }),
      },
    };

    const data = await wirteAlgorithm(writeAlgorithmReq);

    expect(JSON.parse(data.body)).toEqual(
      expect.objectContaining({
        errorCode: "JL011",
      }),
    );
  });
});
