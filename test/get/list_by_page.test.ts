import { baseRequest } from "../dummy.data";
import { getAlgorithmListByUser } from "../../src/handler";

describe("Test bring Algorithm List By Page", () => {
  const pageReq = {
    ...baseRequest,
    pathPrameters: { type: "page" },
  };
  test("It shuould be success", async () => {
    const result = await getAlgorithmListByUser({ ...pageReq });
    expect(result.statusCode).toEqual(200);
  });

  test("1.(count) It should be code is JL007", async () => {
    const result = await getAlgorithmListByUser({
      ...pageReq,
      queryStringParameters: { count: "asdf" },
    });
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        code: "JL007",
      }),
    );
  });

  test("2.(page) It should be code is JL007", async () => {
    const result = await getAlgorithmListByUser({
      ...pageReq,
      queryStringParameters: { criteria: "Asdf" },
    });
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        code: "JL007",
      }),
    );
  });
});
