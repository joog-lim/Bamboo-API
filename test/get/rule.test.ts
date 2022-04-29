import { bold13, bold15, ruleForWeb, rules } from "../../src/config";
import { getAlgorithmRules, getAlgorithmRulesForWeb } from "../../src/handler";
import { baseRequest } from "../dummy.data";

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
