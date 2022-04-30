import { baseRequest } from "../dummy.data";
import { getAlgorithmListByUser, addComment } from "../../src/handler";
import { ADMIN_JWT } from "../config";

describe("get algorithm(alone)", () => {
  const cursorReq = {
    ...{ ...baseRequest, method: "GET" },
    pathParameters: { type: "cursor" },
  };
  const getReq = (idx: number) => ({
    ...baseRequest,
    pathParameters: { idx },
    body: JSON.stringify({ content: "It is Test code" }),
    headers: { authorization: ADMIN_JWT },
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
    const result = await addComment(getReq(targetIdx));

    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        code: "JL000",
      }),
    );
  });
});
