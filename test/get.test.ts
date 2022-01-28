import "reflect-metadata";

import { bold13, bold15, ruleForWeb, rules } from "../src/config";
import {
  getAlgorithmCountAtAll,
  getAlgorithmRules,
  getAlgorithmListByUser,
  getAlgorithmRulesForWeb,
  getVerifyQuestion,
} from "../src/handler";
import { baseRequest } from "./dummy.data";

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
  test("It shuould be success", async () => {
    const result = await getAlgorithmListByUser(
      Object.assign({}, baseRequest, {
        pathParameters: { type: "cursor" },
      }),
    );
    expect(result.statusCode).toEqual(200);
  });

  test("1.(count) It should be ErrorCode is JL007", async () => {
    const req = Object.assign({}, baseRequest, {
      pathParameters: { type: "cursor" },
      queryStringParameters: { count: "asdf" },
    });

    const result = await getAlgorithmListByUser(req);
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        errorCode: "JL007",
      }),
    );
  });

  test("2.(cursor) It should be ErrorCode is JL007", async () => {
    const req = Object.assign({}, baseRequest, {
      pathParameters: { type: "cursor" },
      queryStringParameters: { criteria: "asd" },
    });

    const result = await getAlgorithmListByUser(req);
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        errorCode: "JL007",
      }),
    );
  });

  // test("", async () => {});
  // test("", async () => {});
  // test("", async () => {});
});

describe("Test bring Algorithm List By Page", () => {
  test("It shuould be success", async () => {
    const result = await getAlgorithmListByUser(
      Object.assign({}, baseRequest, {
        pathParameters: { type: "page" },
      }),
    );
    expect(result.statusCode).toEqual(200);
  });

  test("1.(count) It should be ErrorCode is JL007", async () => {
    const req = Object.assign({}, baseRequest, {
      pathParameters: { type: "page" },
      queryStringParameters: { count: "asdf" },
    });

    const result = await getAlgorithmListByUser(req);
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        errorCode: "JL007",
      }),
    );
  });

  test("2.(page) It should be ErrorCode is JL007", async () => {
    const req = Object.assign({}, baseRequest, {
      pathParameters: { type: "page" },
      queryStringParameters: { criteria: "asdf" },
    });

    const result = await getAlgorithmListByUser(req);
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        errorCode: "JL007",
      }),
    );
  });

  // test("", async () => {});
  // test("", async () => {});
  // test("", async () => {});
});
