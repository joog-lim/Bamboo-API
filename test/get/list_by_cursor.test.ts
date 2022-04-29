import { baseRequest } from "../dummy.data";
import { getAlgorithmListByUser } from "../../src/handler";

describe("Test bring Algorithm List By Cursor", () => {
  const cursorReq = {
    ...baseRequest,
    pathParameters: { type: "cursor" },
  };
  test("It shuould be success", async () => {
    const result = await getAlgorithmListByUser({
      ...cursorReq,
    });

    expect(result.statusCode).toEqual(200);
  });

  test("1.(count) It should be code is JL007", async () => {
    const result = await getAlgorithmListByUser({
      ...cursorReq,
      queryStringParameters: { count: "asdf" },
    });

    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        code: "JL007",
      }),
    );
  });

  test("2.(cursor) It should be code is JL007", async () => {
    const req = Object.assign({}, baseRequest, {
      pathParameters: { type: "cursor" },
      queryStringParameters: { criteria: "asd" },
    });

    const result = await getAlgorithmListByUser(req);
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        code: "JL007",
      }),
    );
  });
});
