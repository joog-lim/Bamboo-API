import "reflect-metadata";

import { bold13, bold15, ruleForWeb, rules } from "../src/config";
import {
  getAlgorithmCountAtAll,
  getAlgorithmRules,
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
      })
    );
  });
});

describe("Test the rule pages", () => {
  test("It should response RulePageData", async () => {
    expect(JSON.parse((await getAlgorithmRules(baseRequest)).body)).toEqual({
      content: rules,
      bold13,
      bold15,
    });
  });

  test("It should response RulePageDataForWeb", async () => {
    expect(
      JSON.parse((await getAlgorithmRulesForWeb(baseRequest)).body)
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
      })
    );
  });

  test("It should be id matches regex", async () => {
    const result = await getVerifyQuestion(baseRequest);
    const idRegex = /^[a-z0-9]+\-([a-z0-9]{4}\-){3}[a-z0-9]+$/;
    expect(idRegex.test(JSON.parse(result.body).id)).toBe(true);
  });
});
