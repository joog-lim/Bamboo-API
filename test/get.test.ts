import "reflect-metadata";

import { bold13, bold15, ruleForWeb, rules } from "../src/config";
import {
  getAlgorithmCountAtAll,
  getAlgorithmRules,
  getAlgorithmListByUser,
  getAlgorithmRulesForWeb,
  getVerifyQuestion,
} from "../src/handler";
import { baseRequest as dummy } from "./dummy.data";

const baseRequest = {
  ...dummy,
  httpMethod: "GET",
};

describe("Test the getAlgorithmCountAtAll", () => {
  test("It should responsecode is 200", async () => {
    const data = await getAlgorithmCountAtAll(baseRequest);
    expect(data).toEqual(
      expect.objectContaining({
        statusCode: 200,
      }),
    );
  });
});

describe("Test the rule pages", () => {
  test("It should response RulePageData", async () => {
    expect(
      JSON.parse((await getAlgorithmRules(baseRequest)).body).data,
    ).toEqual({
      content: rules,
      bold13,
      bold15,
    });
  });

  test("It should response RulePageDataForWeb", async () => {
    expect(
      JSON.parse((await getAlgorithmRulesForWeb(baseRequest)).body).data,
    ).toEqual({
      content: ruleForWeb,
    });
  });
});

describe("Test the get verify question", () => {
  test("It should be statudCode is 200", async () => {
    const result = await getVerifyQuestion(baseRequest);
    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 200,
      }),
    );
  });

  test("It should be id matches regex", async () => {
    const result = await getVerifyQuestion(baseRequest);
    const idRegex = /^[a-z0-9]+\-([a-z0-9]{4}\-){3}[a-z0-9]+$/;
    expect(idRegex.test(JSON.parse(result.body).data.id)).toBe(true);
  });
});

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
