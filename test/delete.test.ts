import "reflect-metadata";

import { ADMIN_JWT } from "./config";
import { baseRequest } from "./dummy.data";

import { deleteAlgorithm, getAlgorithmListByUser } from "../src/handler";

describe("delete algorithm", () => {
  const cursorReq = {
    ...{ ...baseRequest, method: "GET" },
    pathParameters: { type: "cursor" },
  };

  const getDeleteReq = (idx: number) => ({
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

  test("wiil be success", async () => {
    const targetAlgorithm = await getAlgorithm();

    const result = await deleteAlgorithm({
      ...getDeleteReq(targetAlgorithm.idx),
      headers: { authorization: ADMIN_JWT },
    });

    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        code: "JL000",
      }),
    );
  });

  test("will be faild with JL002", async () => {
    const targetAlgorithm = await getAlgorithm();

    const result = await deleteAlgorithm({
      ...getDeleteReq(targetAlgorithm.idx),
      headers: {},
    });

    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({ code: "JL002" }),
    );
  });
});
