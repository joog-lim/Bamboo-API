import { baseRequest } from "../dummy.data";
import { getAlgorithmListByUser, getAlgorithmByUser } from "../../src/handler";

describe("get algorithm(alone)", () => {
  const cursorReq = {
    ...{ ...baseRequest, method: "GET" },
    pathParameters: { type: "cursor" },
  };
  const getReq = (idx: string) => ({
    ...baseRequest,
    pathParameters: { idx },
  });

  const getAlgorithm = async () => {
    return JSON.parse(
      (
        await getAlgorithmListByUser({
          ...cursorReq,
        })
      ).body,
    ).data.data[0];
  };

  test("It should be success", async () => {
    const targetIdx = (await getAlgorithm()).idx;
    const result = await getAlgorithmByUser(getReq(targetIdx + ""));
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        code: "JL000",
      }),
    );
  });
});
