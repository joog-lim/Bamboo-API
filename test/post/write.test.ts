import "reflect-metadata";

import { baseRequest as dummy } from "../dummy.data";
import { VERIFY_ID, VERIFY_ANSWER, ADMIN_JWT } from "../config";
import { writeAlgorithm } from "../../src/handler";
import { APIGatewayEventIncludeConnectionName } from "../../src/DTO/http.dto";

const baseRequest: APIGatewayEventIncludeConnectionName = {
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
    const data = await writeAlgorithm(writeAlgorithmReq);

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

    const data = await writeAlgorithm(writeAlgorithmReq);

    expect(JSON.parse(data.body)).toEqual(
      expect.objectContaining({
        code: "JL003",
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

    const data = await writeAlgorithm(writeAlgorithmReq);
    console.log(writeAlgorithmReq.body);
    expect(JSON.parse(data.body)).toEqual(
      expect.objectContaining({
        code: "JL003",
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

    const data = await writeAlgorithm(writeAlgorithmReq);

    expect(JSON.parse(data.body)).toEqual(
      expect.objectContaining({
        code: "JL011",
      }),
    );
  });

  test("will be success with jwt", async () => {
    const data = await writeAlgorithm({
      ...writeReq,
      ...{ body: JSON.stringify(body) },
      headers: { authorization: ADMIN_JWT },
    });

    expect(JSON.parse(data.body)).toEqual(
      expect.objectContaining({
        code: "JL000",
      }),
    );
  });
});
